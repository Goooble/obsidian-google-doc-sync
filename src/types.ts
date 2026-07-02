export interface LinkedNote {
	googleDocID: string;
	Hash: string;
}

export interface PluginData {
	settings: GdocsSyncPluginSettings;
	files: Record<string, LinkedNote>;
}

export interface Metadata {
	googleDocID: string;
	Hash: string;
}

export interface SyncProvider {
	upload(id: string, content: string): Promise<void>;

	download(id: string): Promise<string>;

	exists(id: string): Promise<boolean>;
}

export interface GdocsSyncPluginSettings {
	clientID: string;
	clientSecret: string;
}
