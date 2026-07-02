import { App, Modal, SuggestModal, Setting, Notice } from 'obsidian';

type SuggestItem = { id: number; label: string };

const newExistingOptions: SuggestItem[] = [
	{ id: 1, label: 'Create new doc' },
	{ id: 2, label: 'Link existing doc' },
	{ id: 0, label: 'Cancel' },
];

export class NewOrExistingModal extends SuggestModal<SuggestItem> {
	onChoose: (result: number) => void;

	constructor(app: App, onChoose: (result: number) => void) {
		super(app);
		this.onChoose = onChoose;
		this.setPlaceholder('Type to filter options...');
		this.emptyStateText = 'No options';
	}

	getSuggestions(query: string): SuggestItem[] {
		return newExistingOptions.filter((option) =>
			option.label.toLowerCase().includes(query.toLowerCase()),
		);
	}

	renderSuggestion(option: SuggestItem, el: HTMLElement) {
		el.createEl('div', { text: option.label });
	}

	onChooseSuggestion(
		item: SuggestItem,
		evt: MouseEvent | KeyboardEvent,
	): void {
		this.close();
		this.onChoose(item.id);
		new Notice(`You selected: ${item.label}`);
	}
}

export class CreateModal extends Modal {
	onSubmit: (result: string) => void;

	constructor(app: App, onSubmit: (result: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl('h2', { text: 'Create Google doc draft' });

		let name = '';

		new Setting(contentEl)
			.setName('Title')
			.setDesc('Enter a title for the new Google doc draft.')
			.addText((text) =>
				text
					.setPlaceholder('Document title or ID')
					.onChange((value) => {
						name = value;
					}),
			);

		new Setting(contentEl)
			.addButton((btn) =>
				btn
					.setButtonText('Create')
					.setCta()
					.onClick(() => {
						this.close();
						this.onSubmit(name);
					}),
			)
			.addButton((btn) =>
				btn.setButtonText('Cancel').onClick(() => {
					this.close();
					this.onSubmit('');
				}),
			);
	}

	onClose() {
		this.contentEl.empty();
	}
}

export class LinkModal extends Modal {
	onSubmit: (result: string) => void;

	constructor(app: App, onSubmit: (result: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl('h2', { text: 'Link existing Google doc' });

		let value = '';

		new Setting(contentEl)
			.setName('Document')
			.setDesc(
				'Paste the Google doc ID or shareable URL you want to link.',
			)
			.addText((text) =>
				text.setPlaceholder('Document ID or URL').onChange((v) => {
					value = v;
				}),
			);

		new Setting(contentEl)
			.addButton((btn) =>
				btn
					.setButtonText('Link')
					.setCta()
					.onClick(() => {
						this.close();
						this.onSubmit(value);
					}),
			)
			.addButton((btn) =>
				btn.setButtonText('Cancel').onClick(() => {
					this.close();
					this.onSubmit('');
				}),
			);
	}

	onClose() {
		this.contentEl.empty();
	}
}
