import { Notice, TFile } from 'obsidian';
import GdocsSyncPlugin from '../main';
import { SyncProvider } from '../types';

export class SyncManager {
	constructor(
		private plugin: GdocsSyncPlugin,
		private syncProvider: SyncProvider,
	) {}
	async upload(file: TFile) {
		let data;
		try {
			data = await this.plugin.DataStore.get(file.path);
		} catch (e) {
			new Notice(`File ${file.path} is not linked to a Google Doc`);
			return;
		}
		const content = await this.plugin.app.vault.read(file);
        let currentHash = await hash(content);
		if (currentHash !== data.hash) {
			new Notice('Must be uploaded');
			await this.syncProvider.upload(
				data.googleDocID,
				content,
			);
			//after syncing, update the hash in the data store
			await this.plugin.DataStore.set(file.path, {
                ...data,
                hash: currentHash
            });
		} else {
			new Notice('No changes');
		}
	}

	async download(file: TFile) {
		let data;
		try {
			data = await this.plugin.DataStore.get(file.path);
		} catch (e) {
			//notices is fine here, even though its UI
			new Notice(`File ${file.path} is not linked to a Google Doc`);
			return;
		}
		let content;
		try {
			content = await this.syncProvider.download(data.googleDocID);
		} catch (e) {
			new Notice(`Error downloading file ${file.path}`);
			return;
		}
        let currentHash = await hash(content);
		if (currentHash !== data.hash) {
			new Notice('Must be downloaded');
			await this.plugin.app.vault.modify(file, content);
			//after syncing, update the hash in the data store
			await this.plugin.DataStore.set(file.path, {
                ...data,
                hash: currentHash
            })
		} else {
			new Notice('No changes');
		}
	}

	async linkFile(file: TFile, name: string, isLinked: boolean) {
		let content;
		try {
			content = await this.plugin.app.vault.read(file);
		} catch (e) {
			new Notice(`Error reading file ${file.path}`);
			return;
		}
		let googleDocID: string;
		if (isLinked) {
			new Notice("Already linked");
            return;
		} else {
			googleDocID = await this.syncProvider.create(name, content);
		}
		await this.plugin.DataStore.addFile(
			file.path,
			googleDocID,
			await hash(content),
		);
	}

	async unlinkFile(file: TFile) {
		await this.plugin.DataStore.removeFile(file.path);
	}
}

async function hash(content: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(content);

	const digest = await crypto.subtle.digest('SHA-256', data);

	return Array.from(new Uint8Array(digest))
		.map((byte) => byte.toString(16).padStart(2, '0'))
		.join('');
}
