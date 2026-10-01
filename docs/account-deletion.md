# Account Deletion and Privacy Policy

## Google Play Web Deletion Policy
Google Play requires that apps providing account creation must also provide an in-app and web-based option for account deletion. This document outlines the policy and expected data deletion flow.

### Public Deletion URL
**Web Deletion URL (Placeholder):** `https://example.com/delete-account`

### Policy
When a user requests to delete their account, either through the app or the web deletion URL, all of their personal and historical data will be permanently deleted. This action is irreversible. 

### Categories of Data Deleted
- **User Profile:** Authentication records, email, name, and related profile fields.
- **Portfolios:** All created portfolios and their associated configurations.
- **Transactions:** Any logged trades, investments, and linked transaction history.
- **Behavioral Assessments:** Results, logs, and answers from any behavioral assessment questionnaires.
- **RevenueCat Data:** Subscription records and entitlement mapping associated with the user ID.

### Expected Flow (In-App)
1. User navigates to **Settings** > **Delete Account**.
2. A confirmation dialog appears: *"This permanently deletes your portfolios, transactions and behavioral assessment data."*
3. User confirms deletion.
4. The client triggers a callable Firebase Function (`deleteUserAccount`).
5. The backend safely removes database entries and calls third-party APIs (like RevenueCat) for deletion.
6. The client completes the deletion by calling Firebase Authentication's `deleteUser()` method.
7. *Note:* If the user's session has expired or requires a recent login, the user will be prompted to re-authenticate before retrying the deletion.

### Expected Flow (Web)
1. User navigates to the public web deletion URL.
2. User authenticates via the web portal using the same credentials used in the app.
3. User selects "Delete Account" and confirms the action.
4. The same backend processes are triggered to wipe all associated data.
