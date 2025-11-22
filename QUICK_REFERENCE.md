# Quick Reference: Community Plugin Submission

## TL;DR

Your plugin is **ready for submission**! Follow these steps:

### 1. Generate the Entry
```bash
npm run community-entry
```

### 2. Fork obsidian-releases
Go to https://github.com/obsidianmd/obsidian-releases and click "Fork"

### 3. Add Your Entry
Clone your fork and add the generated entry to the END of `community-plugins.json`

### 4. Create PR
Push your changes and create a pull request to obsidianmd/obsidian-releases

---

## Full Documentation

- 📖 **Complete Instructions**: See [COMMUNITY_SUBMISSION.md](COMMUNITY_SUBMISSION.md)
- ✅ **Verification Results**: See [VERIFICATION.md](VERIFICATION.md)
- 📋 **Implementation Details**: See [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)

## Your Plugin Entry

```json
{
	"id": "excalidraw-import",
	"name": "Excalidraw Import",
	"author": "Avonar",
	"description": "Import Excalidraw scenes from URLs.",
	"repo": "avonar/obsidian-excalidraw-import"
}
```

**Important**: Add a comma after the previous entry in community-plugins.json!

## Useful Commands

```bash
# Generate community entry
npm run community-entry

# Build the plugin
npm run build

# Run tests
npm test

# Validate JSON files
cat manifest.json | jq .
cat versions.json | jq .
```

## All Requirements Met ✅

- ✅ Plugin ID doesn't contain "obsidian" or "plugin"
- ✅ Plugin name doesn't contain "Obsidian" or "Plugin"
- ✅ Description ends with period
- ✅ README with usage instructions exists
- ✅ LICENSE file exists
- ✅ versions.json maps 0.0.3 → 0.15.0
- ✅ GitHub release 0.0.3 exists
- ✅ main.js, manifest.json, styles.css present
- ✅ No security vulnerabilities

## Questions?

Refer to the detailed guides:
- **How to submit?** → [COMMUNITY_SUBMISSION.md](COMMUNITY_SUBMISSION.md)
- **Requirements met?** → [VERIFICATION.md](VERIFICATION.md)
- **What was changed?** → [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
