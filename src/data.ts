import GDocsSyncPlugin from './main';

import { Metadata } from './types';

export default class DataStore {
	constructor(private plugin: GDocsSyncPlugin) {}

	async get(file: string) {}

	async set(file: string, data: Metadata) {}

	async save() {}
}
