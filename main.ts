import { App, Modal, Notice, Plugin, TextComponent } from 'obsidian';
import { downloadExcalidraw } from './src/excalidrawDownloader';

export default class ExcalidrawImportPlugin extends Plugin {

	async onload() {
		// Command to import Excalidraw from URL
		this.addCommand({
			id: 'import-excalidraw-from-url',
			name: 'Import Excalidraw from URL',
			callback: () => {
				new ExcalidrawUrlModal(this.app, this).open();
			}
		});
	}

	onunload() {
		// Cleanup if needed
	}

	async importFromUrl(url: string): Promise<void> {
		try {
			new Notice('Downloading Excalidraw scene...');
			const scene = await downloadExcalidraw(url);
			
			// Generate filename based on current date
			const now = new Date();
			const day = String(now.getDate()).padStart(2, '0');
			const month = String(now.getMonth() + 1).padStart(2, '0');
			const year = String(now.getFullYear()).slice(-2);
			const filename = `${year}-${month}-${day}.excalidraw`;
			
			// Check if file already exists and add suffix if needed
			let finalFilename = filename;
			let counter = 1;
			while (await this.app.vault.adapter.exists(finalFilename)) {
				finalFilename = `${year}-${month}-${day}-${counter}.excalidraw`;
				counter++;
			}
			
			// Save to vault
			await this.app.vault.create(finalFilename, JSON.stringify(scene, null, 2));
			new Notice(`Saved: ${finalFilename}`);
		} catch (error) {
			new Notice(`Error: ${(error as Error).message}`);
			console.error('[Excalidraw Import]', error);
		}
	}
}

class ExcalidrawUrlModal extends Modal {
	plugin: ExcalidrawImportPlugin;
	urlInput: TextComponent;

	constructor(app: App, plugin: ExcalidrawImportPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl('h2', { text: 'Import Excalidraw from URL' });
		
		contentEl.createEl('p', { 
			text: 'Enter an Excalidraw URL (e.g., https://excalidraw.com/#json=... or https://excalidraw.com/#room=...)'
		});

		const inputContainer = contentEl.createDiv({ cls: 'excalidraw-import-input' });
		
		const inputEl = inputContainer.createEl('input', {
			type: 'text',
			placeholder: 'https://excalidraw.com/#json=...'
		});
		inputEl.style.width = '100%';
		inputEl.style.marginBottom = '10px';

		const buttonContainer = contentEl.createDiv({ cls: 'excalidraw-import-buttons' });
		buttonContainer.style.display = 'flex';
		buttonContainer.style.justifyContent = 'flex-end';
		buttonContainer.style.gap = '10px';

		const cancelBtn = buttonContainer.createEl('button', { text: 'Cancel' });
		cancelBtn.addEventListener('click', () => this.close());

		const importBtn = buttonContainer.createEl('button', { text: 'Import', cls: 'mod-cta' });
		importBtn.addEventListener('click', async () => {
			const url = inputEl.value.trim();
			if (url) {
				this.close();
				await this.plugin.importFromUrl(url);
			} else {
				new Notice('Please enter a URL');
			}
		});

		// Handle Enter key
		inputEl.addEventListener('keydown', async (e) => {
			if (e.key === 'Enter') {
				const url = inputEl.value.trim();
				if (url) {
					this.close();
					await this.plugin.importFromUrl(url);
				}
			}
		});

		// Focus input
		inputEl.focus();
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
