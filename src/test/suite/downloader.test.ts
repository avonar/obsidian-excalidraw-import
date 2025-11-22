import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import { downloadExcalidraw } from '../../excalidrawDownloader';

describe('Excalidraw Downloader Test Suite', () => {

    it('should download from JSON URL', async () => {
        const url = 'https://excalidraw.com/#json=iZjneM_FyVAopRFr6j0HR,oUua4UgiBHpuehmPsp3MCg';
        try {
            const scene = await downloadExcalidraw(url);
            assert.ok(scene, 'Scene should be defined');
            assert.strictEqual(scene.type, 'excalidraw', 'Scene type should be excalidraw');
            assert.ok(Array.isArray(scene.elements), 'Elements should be an array');
            console.log('Successfully downloaded JSON scene with ' + scene.elements.length + ' elements');

            // Save to current directory
            const now = new Date();
            const day = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const year = String(now.getFullYear()).slice(-2);
            const filename = `${day}-${month}-${year}.excalidraw`;
            const filepath = path.join(process.cwd(), filename);

            fs.writeFileSync(filepath, JSON.stringify(scene, null, 2), 'utf8');
            console.log(`Saved to ${filepath}`);
        } catch (err) {
            assert.fail(`Download failed: ${(err as Error).message}`);
        }
    });

    it('should try to download from Room URL (might fail if not persisted)', async () => {
        const url = 'https://excalidraw.com/#room=f15d632f15a515ddfcfd,Uak2P-GzHSXNH39tBSBfuQ';
        try {
            const scene = await downloadExcalidraw(url);
            assert.ok(scene, 'Scene should be defined');
            assert.strictEqual(scene.type, 'excalidraw', 'Scene type should be excalidraw');
            console.log('Successfully downloaded Room scene');
        } catch (err) {
            // It is expected that some room URLs might not work if they are not persisted.
            // We just log it here.
            console.log(`Room download failed (expected if not persisted): ${(err as Error).message}`);
        }
    });

    it('should reject invalid URL', async () => {
        const url = 'https://excalidraw.com/#invalid';
        try {
            await downloadExcalidraw(url);
            assert.fail('Should have thrown an error');
        } catch (err) {
            assert.ok((err as Error).message.includes('Invalid Excalidraw URL format'));
        }
    });
});
