import { TFile } from 'obsidian';
import MetadataStore from '../data';
import DataStore from '../data';
import GdocsSyncPlugin from '../main';

export class SyncManager {
	constructor(private plugin: GdocsSyncPlugin) {}
	async sync(file: TFile) {
		console.log(`Syncing file: ${file.path}`);
		const content = await this.plugin.app.vault.read(file);
		console.log(`hash: ` + (await hash(content)));
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

export async function compareHashes(
	content: string,
	previousHash: string,
): Promise<boolean> {
	const currentHash = await hash(content);
	return currentHash === previousHash;
}
