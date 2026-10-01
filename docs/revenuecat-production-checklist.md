# RevenueCat Production Checklist

Use this checklist to verify RevenueCat configuration before deploying to production.

- [ ] **Firebase UID = App User ID**: PASS/FAIL - Verify that the RevenueCat App User ID exactly matches the Firebase Authentication UID.
- [ ] **Pro Entitlement**: PASS/FAIL - Verify that the "pro" entitlement is correctly configured in the RevenueCat dashboard.
- [ ] **Offering**: PASS/FAIL - Verify that the current offering (e.g., "default") is active and correctly linked to the entitlement.
- [ ] **Packages**: PASS/FAIL - Verify that the monthly and/or annual packages are properly set up within the offering.
- [ ] **Displayed Price**: PASS/FAIL - Verify that the paywall UI correctly fetches and displays the localized price from RevenueCat.
- [ ] **Purchase**: PASS/FAIL - Verify that completing a purchase successfully unlocks the "pro" entitlement in the app.
- [ ] **CustomerInfo Refresh**: PASS/FAIL - Verify that CustomerInfo is correctly refreshed upon purchase or restore.
- [ ] **Restore**: PASS/FAIL - Verify that the "Restore Purchases" button successfully restores active subscriptions.
- [ ] **Expiration**: PASS/FAIL - Verify that the app correctly downgrades the user when the subscription expires.
- [ ] **Cancellation**: PASS/FAIL - Verify that canceling the subscription (via sandbox/test store) stops auto-renewal but keeps the entitlement active until the period ends.
- [ ] **User Switch**: PASS/FAIL - Verify that logging out and logging in with a different Firebase account correctly handles RevenueCat App User ID switching.
- [ ] **Logout/login**: PASS/FAIL - Verify that logging out clears RevenueCat caches and logging in fetches the correct CustomerInfo.
- [ ] **Test Store Key Absent in Production**: PASS/FAIL - Verify that the public RevenueCat API key used in the production build is the production key, NOT the test key.
