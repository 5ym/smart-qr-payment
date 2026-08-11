import type { RequestEvent } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { sessions, type User, users } from './db/schema';

export const SESSION_COOKIE = 'session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export type SessionUser = {
	id: number;
	email: string;
	isStaff: boolean;
	isSuperuser: boolean;
};

function toSessionUser(user: User): SessionUser {
	return {
		id: user.id,
		email: user.email,
		isStaff: user.isStaff,
		isSuperuser: user.isSuperuser,
	};
}

export async function hashPassword(password: string): Promise<string> {
	return Bun.password.hash(password, 'argon2id');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	try {
		return await Bun.password.verify(password, hash);
	} catch {
		return false;
	}
}

/** Create a session row and return its opaque id (stored in the cookie). */
export function createSession(userId: number): string {
	const id = crypto.randomUUID();
	const expiresAt = Date.now() + SESSION_TTL_MS;
	db.insert(sessions).values({ id, userId, expiresAt }).run();
	return id;
}

/** Look up the user behind a session id, clearing the session if expired. */
export function validateSession(sessionId: string): SessionUser | null {
	const row = db
		.select({ user: users, expiresAt: sessions.expiresAt })
		.from(sessions)
		.innerJoin(users, eq(sessions.userId, users.id))
		.where(eq(sessions.id, sessionId))
		.get();

	if (!row) return null;
	if (row.expiresAt < Date.now()) {
		db.delete(sessions).where(eq(sessions.id, sessionId)).run();
		return null;
	}
	return toSessionUser(row.user);
}

export function deleteSession(sessionId: string): void {
	db.delete(sessions).where(eq(sessions.id, sessionId)).run();
}

export function setSessionCookie(event: RequestEvent, sessionId: string): void {
	event.cookies.set(SESSION_COOKIE, sessionId, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: !import.meta.env.DEV,
		maxAge: SESSION_TTL_MS / 1000,
	});
}

export function clearSessionCookie(event: RequestEvent): void {
	event.cookies.delete(SESSION_COOKIE, { path: '/' });
}
