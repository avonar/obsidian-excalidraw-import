import * as assert from "assert";
import { downloadExcalidraw, type ExcalidrawScene } from "../../excalidrawDownloader";

describe('Excalidraw Downloader Test Suite', () => {
    it('should download from JSON URL', async () => {
        const url = 'https://excalidraw.com/#json=iZjneM_FyVAopRFr6j0HR,oUua4UgiBHpuehmPsp3MCg';
        try {
            const scene = await downloadExcalidraw(url);
            assert.ok(scene, 'Scene should be defined');

            // Validate Excalidraw scene structure
            assert.strictEqual(scene.type, 'excalidraw', 'Scene type should be excalidraw');
            assert.ok(Array.isArray(scene.elements), 'Elements should be an array');
            assert.ok(typeof scene.version === 'number', 'Version should be a number');
            assert.ok(typeof scene.source === 'string', 'Source should be a string');
            assert.ok(scene.appState && typeof scene.appState === 'object', 'AppState should be an object');

            // Check that elements array is not empty and contains valid elements
            assert.ok(scene.elements.length > 0, 'Elements array should not be empty');
            scene.elements.forEach((element, index) => {
                assert.ok(element && typeof element === 'object', `Element ${index} should be an object`);
                const el = element as any; // Type assertion for Excalidraw element
                assert.ok(typeof el.id === 'string', `Element ${index} should have an id`);
                assert.ok(typeof el.type === 'string', `Element ${index} should have a type`);
            });

            console.log('Successfully downloaded JSON scene with ' + scene.elements.length + ' elements');
        } catch (err) {
            assert.fail(`Download failed: ${(err as Error).message}`);
        }
    });

    it('should return 404 error for non-persisted Room URL', async () => {
        const url = 'https://excalidraw.com/#room=f15d632f15a515ddfcfd,Uak2P-GzHSXNH39tBSBfuQ';
        try {
            await downloadExcalidraw(url);
            assert.fail('Should have thrown an error for non-persisted room');
        } catch (err) {
            const message = (err as Error).message;
            assert.ok(
                message.includes('Scene not found') || message.includes('not be persisted'),
                `Expected 404/not found error, got: ${message}`
            );
            console.log('Room URL correctly returned 404 error');
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
