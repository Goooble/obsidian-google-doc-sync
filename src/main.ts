import { Notice, Plugin } from 'obsidian';
import {
	DEFAULT_SETTINGS,
	GdocsSyncPluginSettings,
	GdocsSyncSettingsTab,
} from './settings';
import { registerCommands } from './commands';

export interface LinkedNote {
	googleDocID: string;
	Hash: string;
}

export interface PluginData {
	settings: GdocsSyncPluginSettings;
	files: Record<string, LinkedNote>;
}

export default class GdocsSyncPlugin extends Plugin {
	data!: PluginData;

	async onload() {
		await this.loadSettings();

		new Notice('Google sync plugin loaded.');

		this.addRibbonIcon('refresh-cw', 'Docs sync', () => {
			const activeFile = this.app.workspace.getActiveFile();
			new Notice(
				activeFile
					? `Active file: ${activeFile.path}`
					: 'No active file',
			);
		});

		this.addStatusBarItem().setText('Google sync');

		registerCommands(this);
		this.addSettingTab(new GdocsSyncSettingsTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		console.log('Loading settings...');
		this.data = Object.assign(
			{},
			{ settings: DEFAULT_SETTINGS, files: {} },
			(await this.loadData()) as PluginData,
		);
	}

	async saveSettings() {
		try {
			await this.saveData(this.data);
		} catch {
			new Notice(`Error saving data`);
		}
	}
}
