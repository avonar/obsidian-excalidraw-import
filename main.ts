import { Plugin, Notice, TFolder, TFile, PluginSettingTab, App, Setting } from 'obsidian';
import { downloadExcalidraw } from './src/excalidrawDownloader';

interface ExcalidrawImportSettings {
    folderPath: string;
}

const DEFAULT_SETTINGS: ExcalidrawImportSettings = {
    folderPath: 'logs'
};

export default class ExcalidrawImportPlugin extends Plugin {
    settings!: ExcalidrawImportSettings;

    async onload() {
        console.log('Loading Excalidraw Import plugin');

        await this.loadSettings();

        this.addCommand({
            id: 'excalidraw-import',
            name: 'EXCALIDRAW Import',
            callback: async () => {
                await this.importExcalidraw();
            }
        });

        this.addSettingTab(new ExcalidrawImportSettingTab(this.app, this));
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async importExcalidraw() {
        // 1. Get URL from user
        const url = await this.promptForUrl();
        if (!url) {
            return;
        }

        try {
            // 2. Download scene
            new Notice('Downloading Excalidraw scene...');
            const sceneData = await downloadExcalidraw(url);

            // 3. Get or create logs folder
            const logsFolder = await this.getOrCreateLogsFolder();

            // 4. Generate filename DD-MM-YY.excalidraw
            const now = new Date();
            const day = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const year = String(now.getFullYear()).slice(-2);
            const filename = `${day}-${month}-${year}.excalidraw`;

            // 5. Save file
            const filePath = `${logsFolder.path}/${filename}`;
            const content = JSON.stringify(sceneData, null, 2);

            // Check if file exists
            const existingFile = this.app.vault.getAbstractFileByPath(filePath);
            if (existingFile instanceof TFile) {
                // File exists, append timestamp to make unique
                const timestamp = now.getTime();
                const uniqueFilename = `${day}-${month}-${year}-${timestamp}.excalidraw`;
                const uniquePath = `${logsFolder.path}/${uniqueFilename}`;
                await this.app.vault.create(uniquePath, content);
                new Notice(`Excalidraw scene saved to ${uniqueFilename}`);
            } else {
                await this.app.vault.create(filePath, content);
                new Notice(`Excalidraw scene saved to ${filename}`);
            }

        } catch (error) {
            new Notice(`Error: ${(error as Error).message}`);
            console.error('Excalidraw import error:', error);
        }
    }

    async promptForUrl(): Promise<string | null> {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: var(--background-primary); padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.3); z-index: 1000;';

            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = 'Enter Excalidraw URL (e.g. https://excalidraw.com/#json=...)';
            input.style.cssText = 'width: 400px; padding: 8px; margin-bottom: 10px; border: 1px solid var(--background-modifier-border); border-radius: 4px; background: var(--background-primary); color: var(--text-normal);';

            const buttonContainer = document.createElement('div');
            buttonContainer.style.cssText = 'display: flex; gap: 10px; justify-content: flex-end;';

            const okButton = document.createElement('button');
            okButton.textContent = 'OK';
            okButton.style.cssText = 'padding: 8px 16px; border-radius: 4px; border: none; background: var(--interactive-accent); color: var(--text-on-accent); cursor: pointer;';

            const cancelButton = document.createElement('button');
            cancelButton.textContent = 'Cancel';
            cancelButton.style.cssText = 'padding: 8px 16px; border-radius: 4px; border: 1px solid var(--background-modifier-border); background: var(--background-primary); color: var(--text-normal); cursor: pointer;';

            const backdrop = document.createElement('div');
            backdrop.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 999;';

            const cleanup = () => {
                modal.remove();
                backdrop.remove();
            };

            okButton.onclick = () => {
                const value = input.value.trim();
                cleanup();
                resolve(value || null);
            };

            cancelButton.onclick = () => {
                cleanup();
                resolve(null);
            };

            input.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    okButton.click();
                } else if (e.key === 'Escape') {
                    cancelButton.click();
                }
            };

            buttonContainer.appendChild(cancelButton);
            buttonContainer.appendChild(okButton);
            modal.appendChild(input);
            modal.appendChild(buttonContainer);

            document.body.appendChild(backdrop);
            document.body.appendChild(modal);
            input.focus();
        });
    }

    async getOrCreateLogsFolder(): Promise<TFolder> {
        const logsPath = this.settings.folderPath;
        const folder = this.app.vault.getAbstractFileByPath(logsPath);

        if (folder instanceof TFolder) {
            return folder;
        }

        // Create folder
        await this.app.vault.createFolder(logsPath);
        return this.app.vault.getAbstractFileByPath(logsPath) as TFolder;
    }

    onunload() {
        console.log('Unloading Excalidraw Import plugin');
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
            .setName('Folder path')
            .setDesc('Folder where Excalidraw files will be saved (relative to vault root)')
            .addText(text => text
                .setPlaceholder('logs')
                .setValue(this.plugin.settings.folderPath)
                .onChange(async (value) => {
                    this.plugin.settings.folderPath = value || 'logs';
                    await this.plugin.saveSettings();
                }));
    }
}
