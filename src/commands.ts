import { Notice } from 'obsidian';
import type GdocsSyncPlugin from './main';
import { CreateModal, LinkModal, NewOrExistingModal } from './modals';

export function registerCommands(plugin: GdocsSyncPlugin): void {
	plugin.addCommand({
		id: 'upload-file',
		name: 'Upload file',
		checkCallback: (checking: boolean) => {
			const activeFile = plugin.app.workspace.getActiveFile();
			if (!activeFile) {
				return false;
			}

			if (!checking) {
				new Notice(`Uploading file: ${activeFile.path}`);
				void plugin.syncManager.upload(activeFile);
			}

			return true;
		},
	});
	plugin.addCommand({
		id: 'download-file',
		name: 'Download file',
		checkCallback: (checking: boolean) => {
			const activeFile = plugin.app.workspace.getActiveFile();
			if (!activeFile) {
				return false;
			}

			if (!checking) {
				new Notice(`Downloading file: ${activeFile.path}`);
				void plugin.syncManager.download(activeFile);
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
								void plugin.syncManager.linkFile(
									activeFile,
									result,
									false,
								);
							}
						}).open();
					} else if (result === 2) {
						new LinkModal(plugin.app, (result: string) => {
							if (result.trim()) {
								new Notice(`Linked document: ${result}`);
								void plugin.syncManager.linkFile(
									//TODO: is void causing problems here? should we await it?
									activeFile,
									result,
									true,
								);
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
					void plugin.syncManager.unlinkFile(activeFile);
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
