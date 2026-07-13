export const REFRESH_TOKEN_KEY = 'gdocs-refresh-token';
export const CLIENT_SECRET_KEY = 'gdocs-client-secret';
export const ACCESS_TOKEN_CACHE_KEY = 'gdocs-access-token';
export const ACCESS_TOKEN_EXPIRY_KEY = 'gdocs-access-token-expiry';
export const PKCE_VERIFIER_KEY = 'gdocs-pkce-verifier';
export const PKCE_STATE_KEY = 'gdocs-pkce-state';

export const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';
export const REDIRECT_URI =
	'https://goooble.github.io/obsidian-google-doc-sync/';
export const SCOPES = [
	'https://www.googleapis.com/auth/drive.file',
	'https://www.googleapis.com/auth/documents',
].join(' ');
export const AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
export const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
