import { App, PluginSettingTab, Setting } from 'obsidian';

import GdocsSyncPlugin from './main';
import { CLIENT_SECRET_KEY } from './auth/constants';

import type { GdocsSyncPluginSettings } from './types';

export const DEFAULT_SETTINGS: GdocsSyncPluginSettings = {
	clientId: '',
};

export class GdocsSyncSettingsTab extends PluginSettingTab {
	plugin: GdocsSyncPlugin;

	constructor(app: App, plugin: GdocsSyncPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		new Setting(containerEl)
			.setName('Client ID')
			.setDesc('Enter your Google OAUTH client ID')
			.addText((text) =>
				text
					.setPlaceholder('Enter your client ID')
					.setValue(this.plugin.data.settings.clientId || '')
					.onChange(async (value) => {
						this.plugin.data.settings.clientId = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName('Client Secret')
			.setDesc(
				'Google OAuth Client Secret for your Web Application OAuth client.',
			)
			.addText((text) => {
				text.setPlaceholder('Enter your client secret');
				text.inputEl.type = 'password';
				const secret =
					this.plugin.app.secretStorage.getSecret(CLIENT_SECRET_KEY);
				text.setValue(secret || '');
				text.onChange(async (value) => {
					await this.plugin.app.secretStorage.setSecret(
						CLIENT_SECRET_KEY,
						value,
					);
				});
			});

		new Setting(containerEl)
			.setName('Login with Google')
			.setDesc('Authenticate with Google')
			.addButton((button) =>
				button.setButtonText('Login with Google').onClick(async () => {
					await this.plugin.oauthManager.login();
				}),
			);
	}
}
