# Store Review Preflight (Rejection Checklist)

Before submitting BiasGuard to the App Store (Apple) and Google Play Store, review this checklist to prevent common rejections.

## 1. App Completeness & Metadata
- [ ] **No Placeholder Content:** Ensure all "lorem ipsum" and placeholder text/images are removed.
- [ ] **Accurate Screenshots:** Screenshots must match the actual app running on the respective platform. No iOS UI on Android screenshots.
- [ ] **Description:** Accurately describes features. Mentions subscription terms clearly.

## 2. Subscriptions & In-App Purchases (RevenueCat)
- [ ] **Terms of Use & Privacy Policy:** Links must be present in the app (usually Settings) and on the store listing.
- [ ] **Clear Pricing:** The paywall clearly displays the price, duration, and what happens after a trial.
- [ ] **Restore Button:** The paywall MUST have a visible "Restore Purchases" button.
- [ ] **Sandbox Testing:** Verify that purchasing and restoring work correctly in the sandbox environment.

## 3. Data & Privacy (Firebase)
- [ ] **Account Deletion:** Users MUST be able to delete their account from within the app.
- [ ] **Data Collection:** Only collect what is stated in the privacy policy. App Tracking Transparency (ATT) prompt implemented if tracking users across apps.
- [ ] **Sign-In with Apple:** If using third-party logins (like Google), you must also provide Sign-In with Apple (iOS only requirement).

## 4. Performance & Stability
- [ ] **No Crashes:** App does not crash on launch or during main workflows (scan text, view history, buy subscription).
- [ ] **IPv6 Support:** Ensure all APIs (Firebase, Marketstack) work over IPv6 networks.

## 5. Content Policy
- [ ] **User-Generated Content:** Since we analyze user text, ensure we don't violate policies on objectionable content, or clarify that the tool is for private drafting.
