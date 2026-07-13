import { createHash, randomBytes } from 'crypto';

const VERIFIER_LENGTH = 64;

function base64UrlEncode(value: Buffer): string {
	return value
		.toString('base64')
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/g, '');
}

export function generateVerifier(): string {
	return base64UrlEncode(randomBytes(VERIFIER_LENGTH));
}

export function generateChallenge(verifier: string): string {
	return base64UrlEncode(createHash('sha256').update(verifier).digest());
}

export function generateState(): string {
	return base64UrlEncode(randomBytes(32));
}
