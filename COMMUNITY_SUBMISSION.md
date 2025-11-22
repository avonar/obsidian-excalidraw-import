# Obsidian Community Plugin Submission Guide

This document provides the information and steps needed to submit the Excalidraw Import plugin to the Obsidian community plugins directory.

## Plugin Information

- **ID**: `excalidraw-import`
- **Name**: Excalidraw Import
- **Author**: Avonar
- **Description**: Import Excalidraw scenes from URLs.
- **Repository**: https://github.com/avonar/obsidian-excalidraw-import
- **Version**: 0.0.3
- **Min Obsidian Version**: 0.15.0

## Submission Checklist

- [x] Plugin ID does not contain "obsidian" or "plugin"
- [x] Plugin name does not contain "Obsidian" or "Plugin"
- [x] Description in manifest.json ends with a period
- [x] README has description and usage instructions
- [x] Valid LICENSE file exists (MIT)
- [x] GitHub release 0.0.3 exists with required files (main.js, manifest.json, styles.css)
- [x] versions.json correctly maps plugin version to minimum Obsidian version

## JSON Entry for community-plugins.json

Add the following entry to the END of the `community-plugins.json` file in the obsidianmd/obsidian-releases repository (before the closing bracket):

```json
	{
		"id": "excalidraw-import",
		"name": "Excalidraw Import",
		"author": "Avonar",
		"description": "Import Excalidraw scenes from URLs.",
		"repo": "avonar/obsidian-excalidraw-import"
	}
```

**Important**: Ensure proper JSON formatting with a comma after the previous entry.

## Submission Steps

Since this process requires manual steps to work with an external repository, follow these steps:

### 1. Fork the obsidian-releases repository

1. Navigate to https://github.com/obsidianmd/obsidian-releases
2. Click the "Fork" button in the top-right corner
3. Create the fork in your GitHub account

### 2. Clone your fork locally

```bash
git clone https://github.com/YOUR_USERNAME/obsidian-releases.git
cd obsidian-releases
```

### 3. Create a new branch

```bash
git checkout -b add-excalidraw-import-plugin
```

### 4. Edit community-plugins.json

1. Open `community-plugins.json` in your editor
2. Navigate to the end of the array (before the closing `]`)
3. Add a comma after the last plugin entry if not already present
4. Add the JSON entry shown above
5. Ensure proper indentation (use tabs to match the file style)

### 5. Validate the JSON

Verify the JSON is valid:

```bash
# Using Python
python3 -m json.tool community-plugins.json > /dev/null && echo "Valid JSON"

# Using jq
jq empty community-plugins.json && echo "Valid JSON"

# Using Node.js
node -e "JSON.parse(require('fs').readFileSync('community-plugins.json'))" && echo "Valid JSON"
```

### 6. Commit and push your changes

```bash
git add community-plugins.json
git commit -m "Add Excalidraw Import plugin"
git push origin add-excalidraw-import-plugin
```

### 7. Create a Pull Request

1. Navigate to your fork on GitHub
2. Click "Contribute" → "Open pull request"
3. Set the base repository to `obsidianmd/obsidian-releases` and base branch to `master`
4. Set the head repository to your fork and compare branch to `add-excalidraw-import-plugin`
5. Title: "Add Excalidraw Import plugin"
6. Description: Brief description of the plugin and confirmation that checklist items are met
7. Click "Create pull request"

## Verification

The obsidianmd/obsidian-releases repository has automated checks that will verify:

- JSON is valid
- Plugin entry follows the required schema
- Plugin ID doesn't contain forbidden words
- Repository exists and is accessible
- Required release files exist (main.js, manifest.json)

## Additional Information

- **Plugin Type**: Desktop only (`isDesktopOnly: true`)
- **Dependencies**: pako (for decompression)
- **Features**:
  - Import from `#json=ID,KEY` format URLs
  - Import from `#room=ROOM_ID,KEY` format URLs  
  - Automatic saving to the `logs` folder
  - Automatic file naming: `DD-MM-YY.excalidraw`

## Support

For questions or issues with the plugin itself, please open an issue at:
https://github.com/avonar/obsidian-excalidraw-import/issues

For questions about the community plugin submission process, refer to:
https://docs.obsidian.md/Plugins/Releasing/Submit+your+plugin
