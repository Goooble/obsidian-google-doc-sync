import GDocsSyncPlugin from './main';
import type { LinkedNote } from './types';

export default class DataStore {
	constructor(private plugin: GDocsSyncPlugin) {}

	async get(file: string) {
		if (!this.plugin.data.files[file]) {
			throw new Error(`File ${file} not found in plugin data`);
		}
		return this.plugin.data.files[file];
	}

	async set(file: string, data: LinkedNote) {
		this.plugin.data.files[file] = data;
		await this.plugin.saveSettings();
	}

	async addFile(file: string, googleDocID: string, hash: string) {
		this.plugin.data.files[file] = {
			googleDocID,
			hash,
		};
		await this.plugin.saveSettings();
	}

	async removeFile(file: string) {
		delete this.plugin.data.files[file];
		await this.plugin.saveSettings();
	}
}
