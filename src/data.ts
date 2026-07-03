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

	async set(file: string, data: LinkedNote) {}

	async saveHash(file: string, hash: string) {
		if (!this.plugin.data.files[file]) {
			throw new Error(`File ${file} not found in plugin data`);
		}
		this.plugin.data.files[file].hash = hash;
		await this.plugin.saveSettings();
	}

	getHash(file: string) {
		if (!this.plugin.data.files[file]) {
			throw new Error(`File ${file} not found in plugin data`);
		}
		return this.plugin.data.files[file].hash;
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

	getID(file: string) {
		if (!this.plugin.data.files[file]) {
			throw new Error(`File ${file} not found in plugin data`);
		}
		return this.plugin.data.files[file].googleDocID;
	}
}
