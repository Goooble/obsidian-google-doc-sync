export interface LinkedNote {
	googleDocID: string;
	hash: string;
}

export interface OAuthSessionData {
	pendingVerifier?: string;
	pendingState?: string;
}

export interface PluginData {
	settings: GdocsSyncPluginSettings;
	files: Record<string, LinkedNote>;
	oauth?: OAuthSessionData;
}

export interface FileMetadata {
	googleDocID: string;
	hash: string;
}

export interface GdocsSyncPluginSettings {
	clientId: string;
}

export interface SyncProvider {
	upload(id: string, content: string): Promise<void>;
	download(id: string): Promise<string>;
	create(name: string, content: string): Promise<string>;
	delete(name: string): Promise<void>;
}
