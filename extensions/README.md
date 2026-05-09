# Extensions

This directory is reserved for optional runtime extensions.

Important rules:
- core framework code must stay outside this directory
- extensions should be installable, removable, enabled, disabled, or validated without modifying core files
- each extension must live in its own directory
- each extension must provide an `extension.json` manifest
- lifecycle state is stored beside the extension package, not inside the framework core
- follow `docs/MODULE_STANDARD.md` when building new modules
- validate manifests against `extensions/extension.schema.json`

Recommended layout:
- `extensions/<extension-id>/extension.json`
- `extensions/<extension-id>/README.md`
- optional entrypoints referenced from the manifest

Manifest example:
```json
{
  "id": "example-extension",
  "name": "Example Extension",
  "version": "0.1.0",
  "apiVersion": "1",
  "description": "Optional extension package for Micro Headless CMS",
  "author": "Your Team",
  "capabilities": ["admin-page", "api"],
  "entrypoints": {
    "adminPage": "./admin/page.tsx",
    "api": "./api/route.ts"
  }
}
```

Current installation strategy:
- production-safe default: manual filesystem install
- optional local installer: ZIP upload when `EXTENSIONS_WRITE_ENABLED=true`
- uploaded packages install into `extensions/`, never into core `modules/`
- lifecycle actions available in admin: `enable`, `disable`, `validate`, `uninstall`

This separation keeps the framework lightweight and reduces the risk of extensions mutating core internals.
