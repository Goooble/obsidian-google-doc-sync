import { App, Notice, PluginSettingTab, Setting } from 'obsidian';

import GdocsSyncPlugin from './main';

import type { GdocsSyncPluginSettings } from './types';

export const DEFAULT_SETTINGS: GdocsSyncPluginSettings = {
	clientID: '232',
	clientSecret: '',
};

export class GdocsSyncSettingsTab extends PluginSettingTab {
	plugin: GdocsSyncPlugin;

	constructor(app: App, plugin: GdocsSyncPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		new Setting(containerEl)
			.setName('Google account')
			.setDesc('Connect your Google account')
			.addText((text) =>
				text
					.setPlaceholder('Enter your clientid')
					.setValue(this.plugin.data.settings.clientID)
					.onChange(async (value) => {
						this.plugin.data.settings.clientID = value;
						await this.plugin.saveSettings();
					}),
			);
		new Setting(containerEl).addButton((button) =>
			button.setButtonText('Connect').onClick(async () => {
				await this.plugin.saveSettings();
				new Notice('Connecting to Google account...');
			}),
		);
	}
}
