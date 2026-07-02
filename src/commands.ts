import { Notice } from 'obsidian';
import type GdocsSyncPlugin from './main';
import { CreateModal, LinkModal, NewOrExistingModal } from './modals';

export function registerCommands(plugin: GdocsSyncPlugin): void {
	plugin.addCommand({
		id: 'sync-file',
		name: 'Sync file',
		checkCallback: (checking: boolean) => {
			const activeFile = plugin.app.workspace.getActiveFile();
			if (!activeFile) {
				return false;
			}

			if (!checking) {
				new Notice(`Syncing file: ${activeFile.path}`);
				void plugin.syncManager.sync(activeFile);
			}

			return true;
		},
	});

	plugin.addCommand({
		id: 'link-google-doc',
		name: 'Link Google doc',
		checkCallback: (checking: boolean) => {
			const activeFile = plugin.app.workspace.getActiveFile();
			if (!activeFile) {
				return false;
			}

			if (!checking) {
				new NewOrExistingModal(plugin.app, (result: number) => {
					if (result === 1) {
						new CreateModal(plugin.app, (result: string) => {
							if (result.trim()) {
								new Notice(`Created document draft: ${result}`);
								plugin.data.files[activeFile.path] = {
									googleDocID: result,
									Hash: '',
								};
								void plugin.saveSettings();
							}
						}).open();
					} else if (result === 2) {
						new LinkModal(plugin.app, (result: string) => {
							if (result.trim()) {
								new Notice(`Linked document: ${result}`);
								plugin.data.files[activeFile.path] = {
									googleDocID: result,
									Hash: '',
								};
								void plugin.saveSettings();
							}
						}).open();
					}
				}).open();
			}

			return true;
		},
	});

	plugin.addCommand({
		id: 'unlink-google-doc',
		name: 'Unlink Google doc',
		checkCallback: (checking: boolean) => {
			const activeFile = plugin.app.workspace.getActiveFile();
			if (!activeFile) {
				return false;
			}

			if (!checking) {
				if (plugin.data.files[activeFile.path]) {
					delete plugin.data.files[activeFile.path];
					void plugin.saveSettings();
					new Notice(`Unlinked document from: ${activeFile.path}`);
				}
			}

			return true;
		},
	});

	// plugin.addCommand({
	// 	id: 'create-google-doc',
	// 	name: 'Create Google doc',
	// 	checkCallback: (checking: boolean) => {
	// 		const activeFile = plugin.app.workspace.getActiveFile();
	// 		if (!activeFile) {
	// 			return false;
	// 		}

	// 		if (!checking) {
	// 			new CreateModal(plugin.app, (result: string) => {
	// 				if (result.trim()) {
	// 					new Notice(`Created document draft: ${result}`);
	// 				}
	// 			}).open();
	// 		}

	// 		return true;
	// 	},
	// });
}
