# Next Manual Actions

This document tracks the manual steps required to proceed with the release and operations of BiasGuard.

## P0 (Critical - Do Before Shipathon/Release)
1. **Set Environment Variables:** Ensure all `.env` files and EAS secrets are configured correctly for production (Firebase keys, RevenueCat keys).
2. **Run Release Validation:** Execute `scripts/validate-release.sh` and ensure it passes completely.
3. **Manual Smoke Test:** Follow `docs/manual-smoke-test.md` using a release build.
4. **App Store Connect / Google Play Console:** Create the new version and fill in the metadata.

## P1 (High Priority - Do Soon)
1. **Generate Screenshots:** Follow `docs/screenshot-runbook.md` to create fresh screenshots for the store listings.
2. **Review Store Preflight:** Complete the checklist in `docs/store-review-preflight.md` to avoid rejection.
3. **Dependency Updates:** Review `docs/dependency-audit.md` and schedule updates for `SAFE_TO_DEFER` items.

## P2 (Medium Priority - Post Release)
1. **Shipathon Demo:** Practice the pitch using `docs/shipaton-demo-script.md`.
2. **Monitor Production:** Keep an eye on Firebase Crashlytics and RevenueCat dashboards for any early issues.
3. **Technical Debt:** Address the `POST_SHIPATON` items from the dependency audit.
