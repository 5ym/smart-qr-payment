/** The QR payload is a 16-char alphanumeric string; validate that shape. */
export function isValidCode(code: string): boolean {
	return /^[A-Za-z0-9]{16}$/.test(code);
}
