import * as crypto from "crypto";
import * as pako from "pako";

export interface ExcalidrawScene {
    type: "excalidraw";
    version: number;
    source: string;
    elements: unknown[];
    appState?: unknown;
}

export async function downloadExcalidraw(url: string): Promise<ExcalidrawScene> {
    console.log('[Excalidraw] Starting download from URL:', url);

    // 1. Parse the URL
    let hash = '';
    try {
        const parsedUrl = new URL(url);
        hash = parsedUrl.hash.slice(1); // Remove '#'
        console.log('[Excalidraw] Parsed hash:', hash);
    } catch (e) {
        throw new Error("Invalid URL");
    }

    let id: string | undefined;
    let keyString: string | undefined;

    if (hash.startsWith('json=')) {
        // Format: #json=ID,KEY
        const parts = hash.split('=')[1].split(',');
        id = parts[0];
        keyString = parts[1];
        console.log('[Excalidraw] JSON format - ID:', id);
    } else if (hash.startsWith('room=')) {
        // Format: #room=ROOM_ID,KEY
        const parts = hash.split('=')[1].split(',');
        id = parts[0];
        keyString = parts[1];
        console.log('[Excalidraw] Room format - ID:', id);
        // Note: This assumes the room is persisted. If not, the fetch will likely fail or return 404.
    } else {
        throw new Error("Invalid Excalidraw URL format. Must contain #json= or #room=");
    }

    if (!id || !keyString) {
        throw new Error("Could not extract ID or Key from URL");
    }

    // 2. Fetch Encrypted Data
    const apiUrl = `https://json.excalidraw.com/api/v2/${id}`;
    console.log('[Excalidraw] Fetching from:', apiUrl);

    const response = await fetch(apiUrl);
    console.log('[Excalidraw] Response status:', response.status);

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error(`Scene not found. If this is a room URL, the scene might not be persisted on the server.`);
        }
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    // New format: binary data with length-prefixed fields
    const arrayBuffer = await response.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const view = new DataView(arrayBuffer);
    console.log('[Excalidraw] Received', bytes.length, 'bytes');

    let offset = 0;

    // Read version (4 bytes, big-endian)
    const version = view.getUint32(offset, false);
    offset += 4;
    console.log('[Excalidraw] Binary format version:', version);

    // Read header length (4 bytes, big-endian)
    const headerLength = view.getUint32(offset, false);
    offset += 4;

    // Read header JSON
    const headerBytes = bytes.slice(offset, offset + headerLength);
    offset += headerLength;
    const headerText = new TextDecoder().decode(headerBytes);
    const header = JSON.parse(headerText) as { version: number; compression: string; encryption: string };
    console.log('[Excalidraw] Header:', header);

    // Read IV length (4 bytes, big-endian)
    const ivLength = view.getUint32(offset, false);
    offset += 4;

    // Read IV
    const iv = bytes.slice(offset, offset + ivLength);
    offset += ivLength;

    // Read ciphertext length (4 bytes, big-endian)
    const ciphertextLength = view.getUint32(offset, false);
    offset += 4;

    // Read ciphertext
    const ciphertext = bytes.slice(offset, offset + ciphertextLength);

    // 3. Decrypt Data
    const key = Buffer.from(keyString, 'base64');

    // Use WebCrypto API (available in Node.js 15+ and VS Code environment)
    const importedKey = await crypto.webcrypto.subtle.importKey(
        "raw",
        key,
        { name: "AES-GCM" },
        true,
        ["decrypt"]
    );

    try {
        const decryptedBuffer = await crypto.webcrypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            importedKey,
            ciphertext
        );

        let decodedString: string;

        // Decompress if needed
        if (header.compression === 'pako@1') {
            const decompressed = pako.inflate(new Uint8Array(decryptedBuffer));
            // The decompressed data has a binary prefix before the JSON
            // Find where the JSON starts (look for '{')
            let jsonStart = 0;
            for (let i = 0; i < decompressed.length; i++) {
                if (decompressed[i] === 0x7b) { // '{'
                    jsonStart = i;
                    break;
                }
            }
            decodedString = new TextDecoder().decode(decompressed.slice(jsonStart));
        } else {
            decodedString = new TextDecoder().decode(decryptedBuffer);
        }

        const sceneData = JSON.parse(decodedString);

        // Debug logging
        console.log('Parsed scene data keys:', Object.keys(sceneData));
        console.log('Scene type:', sceneData.type);
        console.log('Elements count:', sceneData.elements?.length);

        // Validate that we got valid Excalidraw data
        if (!sceneData || typeof sceneData !== 'object') {
            throw new Error('Invalid JSON data: not an object');
        }

        if (sceneData.type !== 'excalidraw') {
            throw new Error(`Invalid Excalidraw data: expected type "excalidraw", got "${sceneData.type || 'undefined'}"`);
        }

        if (!Array.isArray(sceneData.elements)) {
            throw new Error('Invalid Excalidraw data: missing or invalid "elements" array');
        }

        return sceneData as ExcalidrawScene;
    } catch (error) {
        const errMsg = (error as Error).message;
        if (errMsg.includes('Invalid Excalidraw data') || errMsg.includes('Invalid JSON data')) {
            throw error;
        }
        throw new Error(`Decryption failed. The key might be incorrect. Error: ${errMsg}`);
    }
}
