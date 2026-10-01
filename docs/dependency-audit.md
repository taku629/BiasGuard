# Dependency Audit

This document tracks outdated and vulnerable dependencies across the frontend and backend, categorized by their priority for the release.

## Frontend

### RELEASE_BLOCKER (Must fix before ship)
- None currently identified that block the build or pose critical immediate risk.

### SAFE_TO_DEFER (Fix soon, but won't block ship)
- Various `@expo` and `react-native` related packages are slightly outdated but stable.
- Minor vulnerabilities in dev dependencies (e.g., jest, babel plugins).

### POST_SHIPATON (Technical debt to address later)
- Major version bumps for utility libraries.

## Backend (Functions)

### RELEASE_BLOCKER (Must fix before ship)
- None.

### SAFE_TO_DEFER (Fix soon, but won't block ship)
- `firebase-admin` and `firebase-functions` minor updates.

### POST_SHIPATON (Technical debt to address later)
- Major bumps requiring testing or Node version updates.

*(Note: Do not force fix these automatically. Test carefully when updating.)*
