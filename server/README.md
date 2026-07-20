# Optional Receipt Verifier Backend

This FastAPI service validates Apple StoreKit 2 and Google Play Billing receipts server-side. It is **not required** to run the mobile app locally; the app falls back to a mock verifier when no endpoint is configured.

## Local run

```sh
cd server
python -m venv .venv
source .venv/bin/activate
pip install -e .
uvicorn main:app --reload
```

## Deploy to Fly.io (optional)

1. Copy `.env.example` to `.env` and fill in your credentials.
2. Install `flyctl` and authenticate.
3. Run `flyctl deploy` from this directory.

## Environment

See `.env.example`. You can use either separate variables or combined config secrets:

- `APPLE_APPSTORE_CONNECT_CONFIG` — JSON with `issuer_id`, `key_id`, `private_key`.
- `GOOGLE_PLAY_SERVICE_ACCOUNT_CONFIG` — JSON with `service_account_json` and `package_name`.

## Endpoint

`POST /verify-purchase` accepts the contract documented in `docs/STORE_SETUP.md`.
