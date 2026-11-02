# Security recovery review

Prepared 30 October 2026. Source branch: main at f3bd4640d59ecf0e986397d377b06229d3284964.

The confirmed api.js worm, package launchers, appended PostCSS loader and worm helper exclusions are removed. The develop branch helper file is excluded. Branch-specific history is preserved; no history rewrite is included.

Type checking and production build passed. Dependency audit: 0 reported vulnerabilities. Whole-project lint: 9 errors and 31 warnings; these are disclosed, not waived. See the private recovery evidence for full logs. Automatic dependency lifecycle scripts are disabled by .npmrc.

No real login, payments, tenant changes, invitations or production backend calls were performed. Staging integration review remains necessary before production. Historical malicious objects remain in Git history; use updated branch tips and retain investigation evidence.
