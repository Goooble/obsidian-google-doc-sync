import { Notice, requestUrl } from 'obsidian';

import {
	AUTH_ENDPOINT,
	CLIENT_ID,
	CLIENT_SECRET_KEY,
	REDIRECT_URI,
	REFRESH_TOKEN_KEY,
	SCOPES,
	TOKEN_ENDPOINT,
} from './constants';
import { generateChallenge, generateState, generateVerifier } from './PKCE';
import type {
	AuthorizationResponse,
	OAuthErrorResponse,
	TokenResponse,
} from './OAuthTypes';

import type GdocsSyncPlugin from '../main';

export class OAuthManager {
	private pendingVerifier: string | null = null;
	private pendingState: string | null = null;
	private accessToken: string | null = null;
	private accessTokenExpiry: number | null = null;

	constructor(private readonly plugin: GdocsSyncPlugin) {}

	async login(): Promise<void> {
		const credentials = await this.loadRequiredClientCredentials();
		if (!credentials) {
			return;
		}

		this.pendingVerifier = generateVerifier();
		this.pendingState = generateState();
		this.persistPendingAuthData();

		const authorizationUrl = this.buildAuthorizationUrl(
			credentials.clientId,
		);
		window.open(authorizationUrl, '_blank', 'noopener,noreferrer');
		new Notice('Opening Google authentication.');
	}

	async finishLogin(params: Record<string, string>): Promise<void> {
		const oauthData = this.plugin.data.oauth as
			| { pendingVerifier?: string; pendingState?: string }
			| undefined;
		const expectedState =
			this.pendingState ?? oauthData?.pendingState ?? null;
		const storedVerifier =
			this.pendingVerifier ?? oauthData?.pendingVerifier ?? null;
		const response = params as AuthorizationResponse;
		if (response.error) {
			this.clearPendingState();
			new Notice(this.describeOAuthError(response));
			return;
		}

		if (
			!response.state ||
			!expectedState ||
			response.state !== expectedState
		) {
			this.clearPendingState();
			new Notice(
				'Authentication failed because the request state was invalid.',
			);
			return;
		}

		if (!response.code) {
			this.clearPendingState();
			new Notice(
				'The Google sign-in did not return an authorization code.',
			);
			return;
		}

		if (!storedVerifier) {
			this.clearPendingState();
			new Notice('The login flow is missing its pkce verifier.');
			return;
		}

		try {
			const tokenResponse = await this.exchangeCodeForTokens(
				response.code,
				storedVerifier,
			);

			if (!tokenResponse.refresh_token) {
				new Notice(
					'Google did not return a refresh token. Please try again.',
				);
				return;
			}

			await this.saveRefreshToken(tokenResponse.refresh_token);
			this.cacheAccessToken(
				tokenResponse.access_token,
				tokenResponse.expires_in ?? 3600,
			);
			this.clearPendingState();
			new Notice('Successfully connected to Google docs.');
		} catch (error) {
			this.clearPendingState();
			const message =
				error instanceof Error
					? error.message
					: 'Failed to complete Google authentication.';
			new Notice(message);
		}
	}

	async logout(): Promise<void> {
		await this.clearRefreshToken();
		this.accessToken = null;
		this.accessTokenExpiry = null;
		this.pendingVerifier = null;
		this.pendingState = null;
		new Notice('Disconnected from Google docs.');
	}

	async getAccessToken(): Promise<string | null> {
		if (
			this.accessToken &&
			this.accessTokenExpiry &&
			Date.now() < this.accessTokenExpiry
		) {
			return this.accessToken;
		}

		const refreshToken = await this.loadRefreshToken();
		if (!refreshToken) {
			return null;
		}

		try {
			const tokenResponse = await this.refreshAccessToken(refreshToken);
			this.cacheAccessToken(
				tokenResponse.access_token,
				tokenResponse.expires_in ?? 3600,
			);
			return this.accessToken;
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: 'Unable to refresh the Google access token.';
			new Notice(message);
			return null;
		}
	}

	async isAuthenticated(): Promise<boolean> {
		return (
			(await this.loadRefreshToken()) !== null &&
			(await this.loadRefreshToken()) !== ''
		);
	}

	private buildAuthorizationUrl(clientId: string): string {
		const url = new URL(AUTH_ENDPOINT);
		url.searchParams.set('client_id', clientId);
		url.searchParams.set('redirect_uri', REDIRECT_URI);
		url.searchParams.set('response_type', 'code');
		url.searchParams.set('scope', SCOPES);
		url.searchParams.set('access_type', 'offline');
		url.searchParams.set('prompt', 'consent');
		url.searchParams.set(
			'code_challenge',
			generateChallenge(this.pendingVerifier ?? ''),
		);
		url.searchParams.set('code_challenge_method', 'S256');
		url.searchParams.set('state', this.pendingState ?? '');
		return url.toString();
	}

	private async exchangeCodeForTokens(
		code: string,
		verifier: string,
	): Promise<TokenResponse> {
		const credentials = await this.loadRequiredClientCredentials();
		if (!credentials) {
			throw new Error('A Google OAuth Client Secret must be configured.');
		}

		const params = new URLSearchParams({
			client_id: credentials.clientId,
			client_secret: credentials.clientSecret,
			code,
			code_verifier: verifier,
			redirect_uri: REDIRECT_URI,
			grant_type: 'authorization_code',
		});

		const response = await fetch(TOKEN_ENDPOINT, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: params.toString(),
		});

		const text = await response.text();

		let data: TokenResponse | OAuthErrorResponse;

		try {
			data = JSON.parse(text);
		} catch {
			throw new Error(`Google returned a non-JSON response:\n${text}`);
		}

		if (!response.ok) {
			console.error('Google OAuth Error:', data);
			throw new Error(JSON.stringify(data, null, 2));
		}

		return data as TokenResponse;
	}
	private async refreshAccessToken(
		refreshToken: string,
	): Promise<TokenResponse> {
		const credentials = await this.loadRequiredClientCredentials();
		if (!credentials) {
			throw new Error('A Google OAuth Client Secret must be configured.');
		}
		const params = new URLSearchParams({
			client_id: credentials.clientId,
			client_secret: credentials.clientSecret,
			refresh_token: refreshToken,
			grant_type: 'refresh_token',
		});

		const response = await requestUrl({
			url: TOKEN_ENDPOINT,
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: params.toString(),
		});
		const data = response.json as TokenResponse | OAuthErrorResponse;
		if (response.status >= 400) {
			throw new Error(this.describeTokenError(data));
		}

		return data as TokenResponse;
	}

	private async saveRefreshToken(token: string): Promise<void> {
		this.plugin.app.secretStorage.setSecret(REFRESH_TOKEN_KEY, token);
	}

	private async loadRefreshToken(): Promise<string | null> {
		return this.plugin.app.secretStorage.getSecret(REFRESH_TOKEN_KEY);
	}

	private async clearRefreshToken(): Promise<void> {
		this.plugin.app.secretStorage.setSecret(REFRESH_TOKEN_KEY, '');
	}

	private async saveClientSecret(secret: string): Promise<void> {
		this.plugin.app.secretStorage.setSecret(CLIENT_SECRET_KEY, secret);
	}

	private async loadClientSecret(): Promise<string | null> {
		return this.plugin.app.secretStorage.getSecret(CLIENT_SECRET_KEY);
	}

	private async clearClientSecret(): Promise<void> {
		this.plugin.app.secretStorage.setSecret(CLIENT_SECRET_KEY, '');
	}

	private async loadRequiredClientCredentials(): Promise<{
		clientId: string;
		clientSecret: string;
	} | null> {
		const clientId = this.plugin.data.settings.clientId.trim() || CLIENT_ID;
		if (!clientId || clientId === CLIENT_ID) {
			new Notice(
				'Enter a Google OAuth client ID in the plugin settings first.',
			);
			return null;
		}

		const clientSecret = await this.loadClientSecret();
		if (!clientSecret) {
			new Notice(
				'A Google OAuth Client Secret must be configured before signing in.',
			);
			return null;
		}

		return { clientId, clientSecret };
	}

	private cacheAccessToken(token: string, expiresInSeconds: number): void {
		this.accessToken = token;
		this.accessTokenExpiry = Date.now() + expiresInSeconds * 1000;
	}

	private clearPendingState(): void {
		this.pendingVerifier = null;
		this.pendingState = null;
		this.persistPendingAuthData();
	}

	private persistPendingAuthData(): void {
		const oauthData = (this.plugin.data.oauth ?? {}) as {
			pendingVerifier?: string;
			pendingState?: string;
		};
		this.plugin.data.oauth = oauthData;

		if (this.pendingVerifier) {
			oauthData.pendingVerifier = this.pendingVerifier;
		} else {
			delete oauthData.pendingVerifier;
		}

		if (this.pendingState) {
			oauthData.pendingState = this.pendingState;
		} else {
			delete oauthData.pendingState;
		}

		void this.plugin.saveSettings();
	}

	private describeOAuthError(response: AuthorizationResponse): string {
		if (response.error === 'access_denied') {
			return 'Google sign-in was cancelled.';
		}
		return response.error_description ?? 'Google authentication failed.';
	}

	private describeTokenError(
		response: TokenResponse | OAuthErrorResponse,
	): string {
		if ('error' in response) {
			if (response.error === 'invalid_grant') {
				return 'The refresh token has expired or became invalid. Please sign in again.';
			}
			return response.error_description ?? 'The token exchange failed.';
		}
		return 'The token exchange failed.';
	}
}
