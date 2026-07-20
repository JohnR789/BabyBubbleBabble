# Store Setup & Receipt Validation

## Overview

`BabyBubbleBabble` uses `expo-iap` for in-app purchases and a backend verifier to validate receipts before unlocking premium content. The client never trusts a purchase on its own.

## Client-side configuration

Copy `.env.example` to `.env` and set:

```bash
EXPO_PUBLIC_PURCHASE_VERIFICATION_URL=https://your-server.com/verify-purchase
```

`expo-constants` will pick this up for `process.env.EXPO_PUBLIC_*` values in development builds. For EAS builds, set the variable in `eas.json` or the EAS dashboard.

## Verification endpoint contract

`POST /verify-purchase`

Request body:

```json
{
  "productId": "com.babybubblebabble.premium.yearly",
  "purchaseToken": "...",
  "transactionId": "...",
  "platform": "ios",
  "bundleId": "com.anonymous.babybubblebabble"
}
```

Response body:

```json
{
  "valid": true,
  "expiresAt": 1735689600000
}
```

- `valid` (boolean) — whether the purchase is genuine and active.
- `expiresAt` (number, optional) — Unix epoch in milliseconds when the entitlement expires.

## Platform-specific backend setup

### iOS

1. Create an App Store Connect API key.
2. Call the [App Store Server API](https://developer.apple.com/documentation/appstoreserverapi) `/verifyReceipt` endpoint (for legacy receipts) or validate [AppTransaction](https://developer.apple.com/documentation/storekit/apptransaction) / [Transaction](https://developer.apple.com/documentation/storekit/transaction) signed JWS payloads for StoreKit 2.
3. Use environment-specific keys:
   - `APP_STORE_CONNECT_KEY_ID`
   - `APP_STORE_CONNECT_ISSUER_ID`
   - `APP_STORE_CONNECT_PRIVATE_KEY`

### Android

1. Create a Google Cloud service account with the **Google Play Android Developer** API scope.
2. Call the Google Play Developer API [purchases.products.get](https://developers.google.com/android-publisher/api-ref/rest/v3/purchases.products/get) or [purchases.subscriptions.get](https://developers.google.com/android-publisher/api-ref/rest/v3/purchases.subscriptions/get) using the `purchaseToken`.
3. Use environment-specific values:
   - `GOOGLE_SERVICE_ACCOUNT_JSON` (base64-encoded service account key)
   - `GOOGLE_PACKAGE_NAME`

## Store listing products

Create the following products in App Store Connect and Google Play Console:

- `com.babybubblebabble.premium.monthly`
- `com.babybubblebabble.premium.yearly`

Configure them as auto-renewable subscriptions. Ensure the bundle/package ID matches `com.anonymous.babybubblebabble` or update `app.json` to your real bundle identifier before release.

## Important security notes

- Never store App Store Connect or Google service account credentials in the repo.
- Never enable premium in the app without server verification in production.
- The client falls back to a mock provider when `expo-iap` is unavailable (Expo Go / Jest). The mock does not enable premium in release builds because the app store native module is required.
