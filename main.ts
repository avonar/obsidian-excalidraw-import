import { App, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { downloadExcalidraw } from './src/excalidrawDownloader';

interface ExcalidrawImportSettings {
	saveFolder: string;
}

const DEFAULT_SETTINGS: ExcalidrawImportSettings = {
	saveFolder: 'logs'
};

export default class ExcalidrawImportPlugin extends Plugin {
	settings: ExcalidrawImportSettings;

	async onload() {
		await this.loadSettings();

		// Command to import Excalidraw from URL
		this.addCommand({
			id: 'import-excalidraw-from-url',
			name: 'Import Excalidraw from URL',
			callback: () => {
				new ExcalidrawUrlModal(this.app, this).open();
			}
		});

		// Add settings tab
		this.addSettingTab(new ExcalidrawImportSettingTab(this.app, this));
	}

	onunload() {
		// Cleanup if needed
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
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
			
			// Ensure folder exists
			const folder = this.settings.saveFolder;
			if (folder && !(await this.app.vault.adapter.exists(folder))) {
				await this.app.vault.createFolder(folder);
			}
			
			// Build full path
			const basePath = folder ? `${folder}/${filename}` : filename;
			
			// Check if file already exists and add suffix if needed
			let finalPath = basePath;
			let counter = 1;
			while (await this.app.vault.adapter.exists(finalPath)) {
				const nameWithCounter = `${year}-${month}-${day}-${counter}.excalidraw`;
				finalPath = folder ? `${folder}/${nameWithCounter}` : nameWithCounter;
				counter++;
			}
			
			// Save to vault
			await this.app.vault.create(finalPath, JSON.stringify(scene, null, 2));
			new Notice(`Saved: ${finalPath}`);
		} catch (error) {
			new Notice(`Error: ${(error as Error).message}`);
			console.error('[Excalidraw Import]', error);
		}
	}
}

class ExcalidrawImportSettingTab extends PluginSettingTab {
	plugin: ExcalidrawImportPlugin;

	constructor(app: App, plugin: ExcalidrawImportPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'Excalidraw Import Settings' });

		new Setting(containerEl)
			.setName('Save folder')
			.setDesc('Folder where imported Excalidraw files will be saved. Leave empty to save in vault root.')
			.addText(text => text
				.setPlaceholder('logs')
				.setValue(this.plugin.settings.saveFolder)
				.onChange(async (value) => {
					this.plugin.settings.saveFolder = value.trim();
					await this.plugin.saveSettings();
				}));
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
