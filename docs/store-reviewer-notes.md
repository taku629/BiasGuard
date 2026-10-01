# Store Reviewer Notes

**App Purpose**
BiasGuard is an educational financial tool that helps users understand portfolio risk and identify potential behavioral biases in their investment decisions using historical data and psychological heuristic assessments. It does not provide financial or investment advice.

**Signup Flow**
Users can sign up using Email/Password, Google Sign-In, or Apple Sign-In. Upon signup, a user profile is securely created in Firebase Authentication.

**Main Feature Flow**
1. User logs in.
2. User adds assets (tickers and allocations) to their portfolio.
3. App fetches End-of-Day (EOD) market data and calculates risk metrics (Volatility, Beta, Sharpe Ratio).
4. User takes a behavioral assessment quiz.
5. App generates behavioral insights based on quiz responses.

**Subscription Flow (BiasGuard Pro)**
Users can upgrade to BiasGuard Pro via an in-app purchase (managed by RevenueCat) to unlock advanced risk metrics and detailed behavioral insights. 

**Restore Location**
The "Restore Purchases" button is located in the main Settings screen of the app.

**Manage Subscription Location**
Users can find a "Manage Subscription" link in the Settings screen, which redirects them to the native OS subscription management page.

**Deletion Location**
Account deletion is accessible via Settings > Account > Delete Account.

**Privacy Policy Location**
The Privacy Policy can be accessed from the Settings screen and is hosted at: `USER_ACTION_REQUIRED: Insert Privacy Policy URL here`.

**Backend Dependency**
The app relies on Firebase (Auth, Firestore, Cloud Functions), RevenueCat (subscriptions), and Marketstack (EOD market data). An active internet connection is required for core functionality.

**Reviewer Account Requirement**
To fully review the app, please use the following credentials (or use your standard testing accounts):
- **Email:** `USER_ACTION_REQUIRED: Insert test email`
- **Password:** `USER_ACTION_REQUIRED: Insert test password`
