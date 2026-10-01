# Launch Day Checklist

## T-24h
- [ ] **Backend**: Verify all Firebase Cloud Functions and Firestore Rules are deployed to production.
- [ ] **Legal URLs**: Verify Privacy Policy and Terms of Service URLs are live and accessible.
- [ ] **Subs**: Verify RevenueCat production API keys are in place and test keys are removed.
- [ ] **Store listing**: Verify App Store and Google Play descriptions, screenshots, and metadata are approved and ready.

## T-6h
- [ ] **Restore**: Perform a final test of the "Restore Purchases" functionality using a sandbox account.
- [ ] **Market data**: Verify the Marketstack API is returning expected EOD data.
- [ ] **Deletion**: Verify the account deletion flow works correctly end-to-end.

## T-1h
- [ ] Verify production server logs are clear of unusual errors.
- [ ] Ensure the support email inbox is monitored.
- [ ] **US availability**: Confirm the app is targeted for release in the US storefronts.

## Launch
- [ ] Release the app on the Apple App Store.
- [ ] Release the app on the Google Play Store.
- [ ] **Shipaton submission**: Submit the final build, demo video, and links to the Shipaton portal.

## Post-1h
- [ ] Monitor Firebase Crashlytics for any immediate crashes.
- [ ] Monitor RevenueCat dashboard for successful initial purchases or errors.
- [ ] Verify first users can successfully create accounts and add assets.

## Post-24h
- [ ] Review customer support tickets for common trends or blockers.
- [ ] Check Marketstack API usage to ensure rate limits are not being approached.
- [ ] Celebrate a successful launch!
