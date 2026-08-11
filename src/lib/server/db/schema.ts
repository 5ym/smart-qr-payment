// Plain row types for the SQLite tables. The table definitions themselves live
// in `ddl.ts` (raw SQL, applied on startup). Column flags stored as SQLite
// integers (0/1) are exposed here as booleans by the query helpers in `repo.ts`.

export interface User {
	id: number;
	email: string;
	passwordHash: string;
	isActive: boolean;
	isStaff: boolean;
	isSuperuser: boolean;
	createdAt: string;
}

export interface Product {
	id: number;
	price: number;
	image: string;
	title: string;
	desc: string;
}

export interface UserProduct {
	id: number;
	userId: number;
	productId: number;
	count: number;
	price: number;
}

export interface Pay {
	id: number;
	userId: number;
	token: string;
	code: string;
	receive: boolean;
	updatedAt: string;
}
