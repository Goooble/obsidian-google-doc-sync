export interface AuthorizationResponse {
	code?: string;
	state?: string;
	error?: string;
	error_description?: string;
}

export interface OAuthErrorResponse {
	error: string;
	error_description?: string;
}

export interface TokenResponse {
	access_token: string;
	expires_in?: number;
	refresh_token?: string;
	scope?: string;
	token_type: string;
	id_token?: string;
}

export type RefreshTokenResponse = TokenResponse;
