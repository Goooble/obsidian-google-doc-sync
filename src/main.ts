import { Notice, Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, GdocsSyncSettingsTab } from './settings';
import { registerCommands } from './commands';
import { SyncManager } from './sync/syncManager';

import type { PluginData } from './types';
import DataStore from './data';
import { LocalProvider } from './sync/syncProvider';

export default class GdocsSyncPlugin extends Plugin {
	data!: PluginData;
	DataStore!: DataStore;
	syncManager!: SyncManager;
	async onload() {
		await this.loadSettings();
		this.DataStore = new DataStore(this);
		this.syncManager = new SyncManager(this, new LocalProvider(this));

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
