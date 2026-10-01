# Firebase Deployment Checklist

Use this checklist to ensure Firebase is correctly configured for production.

- [ ] **Project confirm**: Verify you are operating on the correct production Firebase project.
- [ ] **Functions region**: Verify Cloud Functions are deployed to the correct/intended region.
- [ ] **MARKETSTACK_API_KEY**: Verify the Marketstack API key is securely set in Firebase Secret Manager or environment variables for Cloud Functions.
- [ ] **REVENUECAT_SECRET_API_KEY**: Verify the RevenueCat secret API key is securely set for server-side verification (if applicable) or webhook handling.
- [ ] **Functions deploy**: Verify all Cloud Functions deploy successfully without errors.
- [ ] **Rules deploy**: Verify Firestore Security Rules are deployed and strictly enforce authentication and authorization.
- [ ] **Indexes**: Verify all necessary composite indexes in Firestore are built and active.
- [ ] **Hosting**: Verify Firebase Hosting (if used for web/legal pages) is deployed successfully.
- [ ] **Legal URLs**: Verify Terms of Service and Privacy Policy URLs are live and accessible.
- [ ] **Smoke test**: Perform a full end-to-end smoke test (signup, add asset, fetch risk, take assessment).
- [ ] **Account deletion**: Verify the account deletion process successfully removes the user from Auth and deletes all associated user documents in Firestore.

## Failure & Rollback Checks
- [ ] **Rollback plan**: Document the process for rolling back Firebase Security Rules to the previous version.
- [ ] **Functions rollback**: Document the specific git commit or process to revert and redeploy Cloud Functions in case of critical failure.
