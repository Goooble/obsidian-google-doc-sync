import { Notice, Plugin, requestUrl } from 'obsidian';
import { DEFAULT_SETTINGS, GdocsSyncSettingsTab } from './settings';
import { registerCommands } from './commands';
import { SyncManager } from './sync/syncManager';
import { OAuthManager } from './auth/OAuthManager';

import type { PluginData } from './types';
import DataStore from './data';
import { LocalProvider } from './sync/syncProvider';

export default class GdocsSyncPlugin extends Plugin {
	data!: PluginData;
	DataStore!: DataStore;
	syncManager!: SyncManager;
	oauthManager!: OAuthManager;
	async onload() {
		await this.loadSettings();
		this.DataStore = new DataStore(this);
		this.syncManager = new SyncManager(this, new LocalProvider(this));
		this.oauthManager = new OAuthManager(this);

		new Notice('Google sync plugin loaded.');

		this.addRibbonIcon('refresh-cw', 'Docs sync', async () => {
			const activeFile = this.app.workspace.getActiveFile();
			const token = await this.oauthManager.getAccessToken();
			console.log(token);
			try {
				const response = await requestUrl({
					url: 'https://www.googleapis.com/drive/v3/files?pageSize=5',
					method: 'GET',
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				console.log(response.json);
			} catch (e) {
				console.log(e);
			}

			new Notice(
				activeFile
					? `Active file: ${activeFile.path}`
					: 'No active file',
			);
		});

		this.addStatusBarItem().setText('Google sync');
		this.registerObsidianProtocolHandler('gdocs-sync', (params) => {
			void this.oauthManager.finishLogin(params);
		});
		this.registerObsidianProtocolHandler('gdocs-sync/oauth', (params) => {
			void this.oauthManager.finishLogin(params);
		});

		registerCommands(this);
		this.addSettingTab(new GdocsSyncSettingsTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		const savedData = (await this.loadData()) as Partial<PluginData> | null;
		const savedOAuth = savedData?.oauth as
			| { pendingVerifier?: string; pendingState?: string }
			| undefined;

		this.data = {
			settings: Object.assign(
				{},
				DEFAULT_SETTINGS,
				savedData?.settings ?? {},
			),
			files: Object.assign({}, savedData?.files ?? {}),
			oauth: savedOAuth
				? {
						pendingVerifier: savedOAuth.pendingVerifier,
						pendingState: savedOAuth.pendingState,
					}
				: {},
		};
	}

	async saveSettings() {
		try {
			await this.saveData(this.data);
		} catch {
			new Notice(`Error saving data`);
		}
	}
}
