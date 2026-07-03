import { Notice, TFile } from 'obsidian';
import GdocsSyncPlugin from '../main';
import { SyncProvider } from '../types';

export class SyncManager {
	constructor(
		private plugin: GdocsSyncPlugin,
		private syncProvider: SyncProvider,
	) {}
	async sync(file: TFile) {
		//TODO: should we check if the file is linked first? maybe not, just sync it anyway
		const content = await this.plugin.app.vault.read(file);

		if (
			(await hash(content)) !== this.plugin.DataStore.getHash(file.path)
		) {
			new Notice('Must be synced');
			await this.syncProvider.upload(
				this.plugin.DataStore.getID(file.path),
				content,
			);
			//after syncing, update the hash in the data store
			await this.plugin.DataStore.saveHash(
				file.path,
				await hash(content),
			);
		} else {
			new Notice('No changes');
		}
	}

	async linkFile(file: TFile, nameOrID: string, linked: boolean) {
		const content = await this.plugin.app.vault.read(file);
		let googleDocID: string;
		if (linked) {
			googleDocID = nameOrID;
			//upload the content to the existing google doc
			await this.syncProvider.upload(googleDocID, content);
		} else {
			googleDocID = await this.syncProvider.create(nameOrID, content);
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
