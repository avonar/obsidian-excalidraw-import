#!/usr/bin/env node

/**
 * Generate the community-plugins.json entry for this plugin
 * This script reads manifest.json and outputs the correctly formatted entry
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Read manifest.json
const manifestPath = path.join(__dirname, '..', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// Extract repository info from various sources
const packagePath = path.join(__dirname, '..', 'package.json');
let repoUrl = null;

// Try to get from git remote origin
try {
    const gitUrl = execSync('git remote get-url origin', { 
        cwd: path.join(__dirname, '..'),
        encoding: 'utf8' 
    }).trim();
    const match = gitUrl.match(/github\.com[/:]([\w-]+\/[\w-]+)/);
    if (match) {
        repoUrl = match[1].replace('.git', '');
    }
} catch (err) {
    // Git command failed, continue to other methods
}

// Try to get from package.json if git didn't work
if (!repoUrl && fs.existsSync(packagePath)) {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    if (pkg.repository && pkg.repository.url) {
        // Extract owner/repo from git URL
        const match = pkg.repository.url.match(/github\.com[/:]([\w-]+\/[\w-]+)/);
        if (match) {
            repoUrl = match[1].replace('.git', '');
        }
    }
}

// Try to get from manifest.json authorUrl as last resort
if (!repoUrl && manifest.authorUrl) {
    const match = manifest.authorUrl.match(/github\.com\/([\w-]+)/);
    if (match) {
        // Construct repo URL from author and plugin ID
        repoUrl = `${match[1]}/${manifest.id}`;
    }
}

// If still no repo URL found, error out
if (!repoUrl) {
    console.error('Error: Could not determine repository URL.');
    console.error('Please ensure git remote origin is set, package.json has a repository.url field,');
    console.error('or manifest.json has an authorUrl field.');
    process.exit(1);
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
