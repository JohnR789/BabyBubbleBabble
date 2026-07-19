"""Baby Bubble Babble purchase receipt verifier.

Validates Apple StoreKit 2 and Google Play Billing receipts server-side before
unlocking premium features in the mobile app.
"""

from __future__ import annotations

import base64
import json
import os
import time
from typing import Any

import httpx
import jwt
from fastapi import FastAPI, HTTPException, status
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings


def _load_combined_configs() -> None:
    """Load combined config secrets and export them as environment variables."""
    apple = os.environ.get("APPLE_APPSTORE_CONNECT_CONFIG")
    if apple:
        try:
            cfg = json.loads(apple)
            if "issuer_id" in cfg:
                os.environ["APPLE_ISSUER_ID"] = cfg["issuer_id"]
            if "key_id" in cfg:
                os.environ["APPLE_KEY_ID"] = cfg["key_id"]
            if "private_key" in cfg:
                os.environ["APPLE_PRIVATE_KEY"] = cfg["private_key"]
        except Exception:
            pass
    google = os.environ.get("GOOGLE_PLAY_SERVICE_ACCOUNT_CONFIG")
    if google:
        try:
            cfg = json.loads(google)
            if "service_account_json" in cfg:
                os.environ["GOOGLE_SERVICE_ACCOUNT_JSON_B64"] = base64.b64encode(
                    json.dumps(cfg["service_account_json"]).encode("utf-8")
                ).decode("utf-8")
            if "package_name" in cfg:
                os.environ["GOOGLE_PACKAGE_NAME"] = cfg["package_name"]
        except Exception:
            pass


_load_combined_configs()

app = FastAPI(title="Baby Bubble Babble Purchase Verifier")


class Settings(BaseSettings):
    apple_issuer_id: str = ""
    apple_key_id: str = ""
    apple_private_key: str = ""
    google_service_account_json_b64: str = ""
    google_package_name: str = ""
    bundle_id: str = "com.anonymous.babybubblebabble"
    appstore_environment: str = "production"  # production or sandbox

    class Config:
        env_file = ".env"
        env_prefix = ""
        extra = "ignore"


settings = Settings()


class VerificationRequest(BaseModel):
    productId: str = Field(..., min_length=1)
    purchaseToken: str = Field(..., min_length=1)
    transactionId: str | None = None
    platform: str = Field(..., pattern="^(ios|android)$")
    bundleId: str | None = None


class VerificationResponse(BaseModel):
    valid: bool
    expiresAt: int | None = None
    error: str | None = None


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/verify-purchase", response_model=VerificationResponse)
async def verify_purchase(req: VerificationRequest) -> VerificationResponse:
    bundle_id = req.bundleId or settings.bundle_id

    if req.platform == "ios":
        return await verify_ios(req, bundle_id)

    return await verify_android(req, bundle_id)


def _apple_private_key_pem() -> str:
    key = settings.apple_private_key
    if "BEGIN PRIVATE KEY" in key:
        return key.replace("\\n", "\n")
    try:
        decoded = base64.b64decode(key).decode("utf-8")
        return decoded
    except Exception as exc:
        raise ValueError("APPLE_PRIVATE_KEY is not a valid PEM or base64 string") from exc


def _appstore_base_url() -> str:
    if settings.appstore_environment.lower() == "sandbox":
        return "https://api.storekit-sandbox.itunes.apple.com"
    return "https://api.storekit.itunes.apple.com"


def _make_apple_jwt(bundle_id: str) -> str:
    now = int(time.time())
    payload = {
        "iss": settings.apple_issuer_id,
        "iat": now,
        "exp": now + 600,
        "aud": "appstoreconnect-v1",
        "bid": bundle_id,
    }
    headers = {"kid": settings.apple_key_id, "alg": "ES256", "typ": "JWT"}
    return jwt.encode(payload, _apple_private_key_pem(), algorithm="ES256", headers=headers)


def _decode_apple_jws(jws: str) -> dict[str, Any]:
    # In a production deployment you should verify the Apple root certificate.
    # For this verifier we decode the payload to obtain the transaction info.
    return jwt.decode(
        jws,
        key="",
        algorithms=["ES256"],
        options={"verify_signature": False, "verify_aud": False, "verify_iss": False},
    )


async def verify_ios(req: VerificationRequest, bundle_id: str) -> VerificationResponse:
    if not all([settings.apple_issuer_id, settings.apple_key_id, settings.apple_private_key]):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Apple App Store Server credentials are not configured.",
        )

    transaction_id = req.transactionId or req.purchaseToken
    if not transaction_id:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="transactionId or purchaseToken is required for iOS verification.",
        )

    token = _make_apple_jwt(bundle_id)
    url = f"{_appstore_base_url()}/inApps/v1/transactions/{transaction_id}"

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers={"Authorization": f"Bearer {token}"})

    if response.status_code != 200:
        return VerificationResponse(
            valid=False,
            error=f"Apple verification failed ({response.status_code}): {response.text}",
        )

    data = response.json()
    signed_jws = data.get("signedTransactionInfo") or data.get("transactionInfo")
    if not signed_jws:
        return VerificationResponse(valid=False, error="No transaction info returned by Apple.")

    try:
        transaction = _decode_apple_jws(signed_jws)
    except Exception as exc:
        return VerificationResponse(valid=False, error=f"Could not decode Apple JWS: {exc}")

    if transaction.get("bundleId") != bundle_id:
        return VerificationResponse(valid=False, error="Bundle ID mismatch.")

    if transaction.get("productId") != req.productId:
        return VerificationResponse(valid=False, error="Product ID mismatch.")

    expires_at = transaction.get("expiresDate")
    expires_at_ms = int(expires_at) if expires_at is not None else None

    if transaction.get("revocationDate"):
        return VerificationResponse(valid=False, error="Transaction was revoked.")

    if transaction.get("type") == "Auto-Renewable Subscription" and expires_at_ms:
        if expires_at_ms <= int(time.time() * 1000):
            return VerificationResponse(
                valid=False,
                expiresAt=expires_at_ms,
                error="Subscription has expired.",
            )

    return VerificationResponse(valid=True, expiresAt=expires_at_ms)


def _google_credentials() -> service_account.Credentials:
    raw = settings.google_service_account_json_b64
    if not raw:
        raise ValueError("Google service account JSON is not configured.")
    try:
        decoded = base64.b64decode(raw).decode("utf-8")
        info = json.loads(decoded)
    except Exception as exc:
        raise ValueError("GOOGLE_SERVICE_ACCOUNT_JSON_B64 is not valid base64 JSON.") from exc
    return service_account.Credentials.from_service_account_info(
        info,
        scopes=["https://www.googleapis.com/auth/androidpublisher"],
    )


def _verify_android_subscription(
    package_name: str, product_id: str, token: str
) -> tuple[bool, int | None, str | None]:
    creds = _google_credentials()
    service = build("androidpublisher", "v3", credentials=creds)
    try:
        result = (
            service.purchases()
            .subscriptions()
            .get(packageName=package_name, subscriptionId=product_id, token=token)
            .execute()
        )
        expiry = result.get("expiryTimeMillis")
        if result.get("paymentState") not in (1, 2):
            return False, int(expiry) if expiry else None, "Subscription payment state is not active."
        return True, int(expiry) if expiry else None, None
    except HttpError as exc:
        if exc.resp.status in (404, 410):
            return False, None, "Subscription purchase not found or expired."
        return False, None, f"Google Play verification failed: {exc}"


def _verify_android_product(
    package_name: str, product_id: str, token: str
) -> tuple[bool, int | None, str | None]:
    creds = _google_credentials()
    service = build("androidpublisher", "v3", credentials=creds)
    try:
        result = (
            service.purchases()
            .products()
            .get(packageName=package_name, productId=product_id, token=token)
            .execute()
        )
        purchase_state = result.get("purchaseState")
        return purchase_state == 0, None, None
    except HttpError as exc:
        if exc.resp.status in (404, 410):
            return False, None, "Product purchase not found or consumed."
        return False, None, f"Google Play verification failed: {exc}"


async def verify_android(req: VerificationRequest, bundle_id: str) -> VerificationResponse:
    package_name = settings.google_package_name or bundle_id
    if not all([settings.google_service_account_json_b64, package_name]):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google Play credentials are not configured.",
        )

    # Try subscription first, then one-time product.
    valid, expires_at, error = _verify_android_subscription(
        package_name, req.productId, req.purchaseToken
    )
    if valid:
        return VerificationResponse(valid=True, expiresAt=expires_at)

    valid, expires_at, product_error = _verify_android_product(
        package_name, req.productId, req.purchaseToken
    )
    if valid:
        return VerificationResponse(valid=True, expiresAt=expires_at)

    return VerificationResponse(valid=False, error=error or product_error or "Verification failed.")


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", "8080"))
    uvicorn.run(app, host="0.0.0.0", port=port)
