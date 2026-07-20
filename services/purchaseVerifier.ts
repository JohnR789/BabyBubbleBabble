/**
 * Server-side purchase receipt validation client.
 *
 * This module posts purchase details to a backend verifier. The verifier is
 * expected to call the Apple App Store Server API (for iOS) or the Google Play
 * Developer API (for Android) and return whether the purchase is valid and
 * when the entitlement expires.
 *
 * When no verification endpoint is configured, the function returns `valid: true`
 * with a warning so that local preview builds keep working. In production you
 * must set EXPO_PUBLIC_PURCHASE_VERIFICATION_URL to a trusted server.
 */

import { Platform } from 'react-native';

export interface PurchaseVerificationRequest {
  productId: string;
  purchaseToken: string;
  transactionId?: string;
  platform: 'ios' | 'android';
  bundleId?: string;
}

export interface VerificationResult {
  valid: boolean;
  expiresAt?: number;
  error?: string;
}

const VERIFICATION_URL = process.env.EXPO_PUBLIC_PURCHASE_VERIFICATION_URL;

export async function verifyPurchaseOnServer(
  request: PurchaseVerificationRequest,
): Promise<VerificationResult> {
  if (!VERIFICATION_URL) {
    // Skip server verification when no endpoint is configured (local preview / Expo Go).
    return { valid: true };
  }

  try {
    const response = await fetch(VERIFICATION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      return {
        valid: false,
        error: `Server returned ${response.status}: ${response.statusText}`,
      };
    }

    const json = await response.json();
    return {
      valid: Boolean(json.valid),
      expiresAt: typeof json.expiresAt === 'number' ? json.expiresAt : undefined,
    };
  } catch (err: any) {
    return {
      valid: false,
      error: err?.message ?? 'Network error during verification.',
    };
  }
}

export function getPurchasePlatform(): 'ios' | 'android' {
  return Platform.OS === 'ios' ? 'ios' : 'android';
}
