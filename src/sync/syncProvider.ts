import type { SyncProvider } from '../types';
import GdocsSyncPlugin from '../main';
import { Notice, TFile } from 'obsidian';

export class LocalProvider implements SyncProvider {
	constructor(private plugin: GdocsSyncPlugin) {}

	async upload(id: string, content: string): Promise<void> {
		// Implementation for uploading content
		new Notice(`Uploading content for ID: ${id}`);
		const file = this.plugin.app.vault.getAbstractFileByPath(id + '.md');
		if (file instanceof TFile) {
			return await this.plugin.app.vault.modify(file, content);
		} else {
			return Promise.reject(new Error(`File ${id} not found`));
		}
	}
	download(id: string): Promise<string> {
		// Implementation for downloading content
		new Notice(`Downloading content for ID: ${id}`);
		const file = this.plugin.app.vault.getAbstractFileByPath(id + '.md');
		if (file instanceof TFile) {
			return this.plugin.app.vault.read(file);
		} else {
			return Promise.reject(new Error(`File ${id} not found`));
		}
	}
	async create(name: string, content: string): Promise<string> {
		// Implementation for creating a new file
		const file = await this.plugin.app.vault.create(
			'remote/' + name + '.md',
			content,
		);
		return file.path;
	}
	delete(name: string): Promise<void> {
		// Implementation for deleting a file
		new Notice(`Deleting file with name: ${name}`);
		const file = this.plugin.app.vault.getAbstractFileByPath(
			'remote/' + name + '.md',
		);
		if (file) {
			return this.plugin.app.vault.delete(file);
		} else {
			return Promise.reject(new Error(`File ${name} not found`));
		}
	}
}
