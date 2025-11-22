#!/usr/bin/env node

/**
 * Generate the community-plugins.json entry for this plugin
 * This script reads manifest.json and outputs the correctly formatted entry
 */

const fs = require('fs');
const path = require('path');

// Read manifest.json
const manifestPath = path.join(__dirname, '..', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// Extract repository info from package.json if available
const packagePath = path.join(__dirname, '..', 'package.json');
let repoUrl = 'avonar/obsidian-excalidraw-import';

if (fs.existsSync(packagePath)) {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    if (pkg.repository && pkg.repository.url) {
        // Extract owner/repo from git URL
        const match = pkg.repository.url.match(/github\.com[/:]([\w-]+\/[\w-]+)/);
        if (match) {
            repoUrl = match[1].replace('.git', '');
        }
    }
}

// Generate the entry
const entry = {
    id: manifest.id,
    name: manifest.name,
    author: manifest.author,
    description: manifest.description,
    repo: repoUrl
};

// Output with proper formatting (tabs, matching obsidian-releases style)
console.log('Add this entry to community-plugins.json:');
console.log('');
console.log(JSON.stringify(entry, null, '\t'));
console.log('');
console.log('Note: Ensure there is a comma after the previous entry!');
