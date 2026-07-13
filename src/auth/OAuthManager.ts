import { Notice } from 'obsidian';

import { REFRESH_TOKEN_KEY } from './constants';

import type GdocsSyncPlugin from '../main';

export class OAuthManager {
	constructor(private readonly plugin: GdocsSyncPlugin) {}

	async login(): Promise<void> {
		new Notice('OAuth login not implemented yet.');
	}

	async logout(): Promise<void> {
		await this.clearRefreshToken();
	}

	async getAccessToken(): Promise<string | null> {
		return null;
	}

	async isAuthenticated(): Promise<boolean> {
		return false;
	}

	private async saveRefreshToken(token: string): Promise<void> {
		this.plugin.app.secretStorage.setSecret(REFRESH_TOKEN_KEY, token);
	}

	private async loadRefreshToken(): Promise<string | null> {
		return this.plugin.app.secretStorage.getSecret(REFRESH_TOKEN_KEY);
	}

	private async clearRefreshToken(): Promise<void> {
		const secrets = this.plugin.app.secretStorage.listSecrets();
		if (secrets.includes(REFRESH_TOKEN_KEY)) {
			this.plugin.app.secretStorage.setSecret(REFRESH_TOKEN_KEY, '');
		}
	}
}
