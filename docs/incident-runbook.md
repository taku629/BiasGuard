# Incident Runbook

## 1. Market data down
1. **User impact**: Users cannot fetch current prices or updated risk metrics. The app may show errors or "needs more data."
2. **What to check**: Check the Marketstack API status page. Verify the `MARKETSTACK_API_KEY` is valid and quota has not been exceeded. Check Firebase Cloud Functions logs.
3. **Safe mitigation**: Inform users via an in-app banner or support channels. Rely on cached data where possible.
4. **What NOT to do**: Do not repeatedly retry failed requests to Marketstack, which could lead to rate limiting.

## 2. Functions down
1. **User impact**: Backend calculations, market data fetching, and webhooks will fail.
2. **What to check**: Check Firebase/Google Cloud status page. Review Cloud Functions logs for crashes, timeouts, or deployment errors.
3. **Safe mitigation**: Revert to the last known stable deployment of Cloud Functions.
4. **What NOT to do**: Do not blindly increase function memory or timeout without understanding the root cause.

## 3. RevenueCat down
1. **User impact**: Users cannot make new purchases, restore purchases, or automatically unlock Pro status upon renewal.
2. **What to check**: Check the RevenueCat status page. Verify the RevenueCat API keys in the app.
3. **Safe mitigation**: Allow existing authenticated Pro users to maintain access temporarily via cached CustomerInfo in the SDK. 
4. **What NOT to do**: Do NOT manually edit Pro states in Firestore.

## 4. Firestore permission issue
1. **User impact**: Users may be unable to read their portfolio or save assessments (permission denied errors).
2. **What to check**: Review recent changes to Firestore Security Rules. Test rules in the Firebase Emulator or Rules Playground.
3. **Safe mitigation**: Revert to the previous version of Firestore Security Rules via the Firebase Console.
4. **What NOT to do**: Do not deploy overly permissive rules (e.g., `allow read, write: if true;`) as a quick fix.

## 5. Deletion failure
1. **User impact**: Users attempt to delete their account but receive an error, or their data remains in the database.
2. **What to check**: Check Firebase Auth and Firestore rules. Ensure Cloud Functions (if handling deletion) have the correct permissions. Check for cascading deletion issues.
3. **Safe mitigation**: Instruct the user to contact support for manual deletion while the bug is fixed.
4. **What NOT to do**: Do not manually delete only the Auth record without also deleting the corresponding Firestore data, as it creates orphaned data.

## 6. Purchase mismatch
1. **User impact**: A user is charged by Apple/Google, but BiasGuard does not unlock Pro features.
2. **What to check**: Instruct the user to tap "Restore Purchases." Check RevenueCat dashboard for the specific user's App User ID to verify the receipt was processed.
3. **Safe mitigation**: Ensure the user is logged into the correct App Store account and BiasGuard account.
4. **What NOT to do**: PROHIBITED: Do not perform dangerous manual DB edits of Pro states directly in Firestore. Rely entirely on RevenueCat as the source of truth.
