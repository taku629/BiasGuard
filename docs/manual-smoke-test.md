# Manual Smoke Test Runbook

Perform these steps before any production release.

## 1. Authentication
- [ ] Install fresh app build.
- [ ] Sign up with a new email and password.
- [ ] Log out.
- [ ] Log back in with the same credentials.
- [ ] Test password reset flow.

## 2. Core Functionality (BiasGuard)
- [ ] Open the main scanner interface.
- [ ] Input a sample text and run the bias check.
- [ ] Verify the results display correctly.
- [ ] Check history to ensure the scan was saved.

## 3. RevenueCat / Subscriptions
- [ ] Navigate to the paywall.
- [ ] Verify pricing displays correctly.
- [ ] Purchase a test subscription (using sandbox account).
- [ ] Verify premium features unlock.
- [ ] Restore purchases.

## 4. Edge Cases
- [ ] Disconnect internet and verify offline state handling.
- [ ] Put app in background and resume.
