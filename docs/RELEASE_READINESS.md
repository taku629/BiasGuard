# BiasGuard Release Readiness Report

## 1. Step 7 PASS / FAIL
**PASS**: CODE RC READY — EXTERNAL RELEASE ACTIONS REQUIRED. All code-side release candidate requirements have been fulfilled. The codebase is strictly feature-frozen, privacy-compliant, and production-configured. External actions (credential registration, store purchases) are intentionally BLOCKED.

## 2. RC Version
BiasGuard v1.0.0 RC1 (Build Version: 1.0.0)

## 3. Feature Freeze Status
**ENFORCED**. All feature additions have been frozen. No new behavioral signals, risk metrics, or UI components were added. Only compliance, privacy, account deletion, and production matrix configurations were modified.

## 4. Bundle Identifier
`com.biasguard.app`
*Status*: **USER_CONFIRMATION_REQUIRED** before initial EAS Store build.

## 5. Android Package
`com.biasguard.app`
*Status*: **USER_CONFIRMATION_REQUIRED** before initial EAS Store build.

## 6. Production Configuration Status
**READY**. Development / Preview / Production environments are strictly separated in `eas.json` and `src/config/env.ts`. Production explicitly fail-closes if `CloudMarketDataProvider` or RevenueCat Public SDK keys are missing. Mock data and RevenueCat Test Store keys are prohibited in production.

## 7. Automated Frontend Validation
**PASS**. Run in band to avoid WSL OOM issues:
- `npx tsc --noEmit` -> Exit Code 0
- `npx jest --runInBand` -> Exit Code 0
- `npx expo-doctor` -> Exit Code 0
- `npx expo install --check` -> Exit Code 0
- `npx expo config --type public` -> Exit Code 0

## 8. Functions Validation
**PASS**. Run locally:
- `npm run build` -> Exit Code 0
- `npm test -- --runInBand` -> Exit Code 0
- `npm ls --depth=0` -> Exit Code 0 (clean dependency tree)

## 9. RevenueCat Readiness
**CODE-SIDE READY**. App securely relies on `CustomerInfo.entitlements.active["pro"]` as the singular Source of Truth for gated access. Test store separation logic is established. Account deletion API integration is configured. **EXTERNAL ACTION REQUIRED** to manually set up Dashboard.

## 10. Firebase Readiness
**CODE-SIDE READY**. Firebase Auth, Firestore security rules (explicit deny to caches), and Functions (with Secret Manager bindings for API keys) are configured. Deep recursive account deletion is set up via Callable Function. **EXTERNAL ACTION REQUIRED** to deploy.

## 11. Market Data Readiness
**CODE-SIDE READY**. `CloudMarketDataProvider` is strictly enforced in production. Caching logic avoids excessive queries via `marketDataCoverage`, enforces 24h TTL on historical prices, and correctly utilizes Marketstack API limits (25 tickers/400 days). **EXTERNAL ACTION REQUIRED**: Confirm Marketstack license permits BiasGuard consumer-facing mobile-app display and analysis.

## 12. Privacy Policy Readiness
**DRAFT READY**. `web/public/privacy.html` created. Explains use of Firebase Auth, UID, Firestore portfolio data, behavioral indicators, and RevenueCat identifiers. Mentions no diagnostic/clinical purpose. **USER_INPUT_REQUIRED**: Requires real corporate identity, support email, and public URLs.

## 13. Account Deletion Readiness
**CODE-SIDE READY**. Frontend Settings UI includes Store Subscription cancellation disclaimer. Backend function safely executes: RevenueCat REST API deletion -> Firestore `recursiveDelete` -> Firebase Auth deletion. Fully idempotent and retry-safe (handles already-deleted states gracefully), logs partial failures without erroneously reporting full success.

## 14. Apple Store Readiness
**DRAFT READY**. App Privacy draft generated (`docs/apple-privacy.md`). In-app subscription cancellation redirects to Apple management UI. **EXTERNAL ACTION REQUIRED**: Apple Developer Identity verification and Reviewer Test Account generation.

## 15. Google Play Readiness
**DRAFT READY**. Data Safety form draft generated (`docs/google-data-safety.md`). Account Deletion Web Page source generated. **CRITICAL BLOCKER**: External Account Deletion URL must be published before Data Safety submission.

## 16. Legal Page Readiness
**DRAFT READY**. Web assets created in `web/public/` (Privacy, Terms, Support, Deletion). In-app navigation in `Settings` safely handles missing URLs with an Alert instead of launching fake links. **PUBLIC_URL_REQUIRED** to go live.

## 17. Store Data Inventory Readiness
**CODE-SIDE READY**. `docs/store-data-inventory.md` generated documenting Email, UID, Portfolios, Transactions, Behavioral Signals, and Purchase identifiers with their storage and deletion behaviors.

## 18. Secret Audit
**PASS**. No `MARKETSTACK_API_KEY`, `REVENUECAT_SECRET_API_KEY`, or private keys leaked in the client bundle. Verified via `npx expo config --type public` and global grep.

## 19. Mock/Debug Audit
**PASS**. `MockMarketDataProvider`, `127.0.0.1`, `console.log`, and `TODO`s were strictly audited and classified in `docs/repository-audit.md`. None present in the production release flow.

## 20. Store Listing Readiness
**DRAFT READY**. `docs/store-listing.md` generated with compliance-safe language focusing on educational insights and portfolio visibility. Contains no "guaranteed profit" or "diagnosis" claims.

## 21. Reviewer Flow Readiness
**READY**. `docs/reviewer-flow.md` created mapping the exact E2E path a reviewer takes to hit all features.

## 22. Screenshot Checklist
**READY**. Included in `docs/store-listing.md`. Contains required views (Home, Risk Dashboard, Behavioral Radar, Overconfidence, Paywall).

## 23. RevenueCat Manual Actions
**USER_ACTION_REQUIRED**:
- Create BiasGuard project, iOS/Android apps
- Obtain Store credentials
- Create subscription products, entitlement `pro`, Offerings
- Obtain Public SDK Keys and Secret API Key

## 24. Firebase Manual Actions
**USER_ACTION_REQUIRED**:
- Project configuration
- Secret Manager: bind `MARKETSTACK_API_KEY` and `REVENUECAT_SECRET_API_KEY`
- Deploy Functions and Firestore Rules
- Deploy Hosting for legal pages

## 25. Marketstack Manual Actions
**USER_ACTION_REQUIRED**:
- Confirm commercial/mobile-app display license terms
- Obtain API key

## 26. Apple Manual Actions
**USER_ACTION_REQUIRED**:
- Confirm Bundle Identifier
- Apple Developer identity provisioning

## 27. Google Manual Actions
**USER_ACTION_REQUIRED**:
- Confirm Android Package
- Check Developer Account Type & Creation Date

## 28. Critical Shipaton Blockers
**CRITICAL SHIPATON SCHEDULE BLOCKER**: 
If Google Play Developer Account is Personal AND created after 2023-11-13, a 14-day Closed Test with 12+ opt-in testers is strictly required before Production Access. This must be started immediately to meet the **Sept 30, 2026 23:45 PDT** deadline. Store review takes time, so submission cannot be delayed until the very end.

## 29. USER_ACTION_REQUIRED Items
- Confirm `com.biasguard.app` for iOS/Android
- RevenueCat manual dashboard setup
- Firebase Secret Manager population
- Firebase Functions deployment
- Apple/Google Developer account verifications
- Marketstack License verification
- Provide Support Email and Company Entity Name

## 30. PUBLIC_URL_REQUIRED Items
- Privacy Policy URL
- Terms of Use URL
- Support URL
- External Account Deletion URL (Required for Google Play)

## 31. BLOCKED Items
- Firebase Production Deploy
- EAS Store Build (Credentials Needed)
- App Store / Google Play Submission
- Paid Subscriptions / Purchases

## 32. Exact Production Runbook
Documented step-by-step in `docs/production-runbook.md`.

## 33. RC1 Build Authorization
**READY FOR RC1 BUILD**. The source code is fundamentally ready to be compiled into BiasGuard v1.0.0 RC1 via EAS Build, contingent upon the user performing the manual configuration (identity confirmation and credentials generation).
