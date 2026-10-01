# Architecture Overview

## System Architecture

```mermaid
graph TD
    RN[React Native/Expo App] --> Auth[Firebase Auth]
    RN --> FS[(Firestore)]
    RN --> CF[Callable Functions]
    RN --> RC[RevenueCat]
    RC --> Pro[Pro Entitlements]
```

## Data Fetching Flow

```mermaid
graph TD
    RN[RN App] -->|Call Callable Function| CF[Cloud Functions]
    CF -->|Fetch Market Data| MS[Marketstack API]
    CF -->|Cache Data| Cache[(Cache)]
    MS --> CF
```

## Subscription Flow

```mermaid
graph TD
    UID[Firebase UID] -->|Identify User| RC[RevenueCat]
    RC -->|Verify Purchase| Store[App/Play Store]
    RC -->|Return Status| Pro[Pro Access Granted]
```

## Account Deletion Flow
*Note: This is not an atomic transaction. Failures mid-flight require manual or scheduled cleanup.*

```mermaid
graph TD
    Client[App] -->|Request Deletion| CF[Callable Function]
    CF -->|1. Delete Customer| RC[RC Customer Delete]
    CF -->|2. Recursive Delete| FS[Firestore Data]
    CF -->|3. Delete User| Auth[Auth Delete]
```
