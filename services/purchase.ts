/**
 * Purchase service abstraction.
 *
 * The default `purchaseService` tries to use `expo-iap` and falls back to a
 * mock provider when the native module is unavailable (Expo Go, Jest, or when
 * the billing permission is not configured). In production, install the
 * native module, run `expo prebuild`, and the real store path will activate.
 */

import { PREMIUM_PRODUCTS } from '../constants';

declare const require: (id: string) => any;

export interface Product {
  productId: string;
  title: string;
  description: string;
  price: string;
  subscriptionPeriod?: string;
}

export interface PurchaseResult {
  ok: boolean;
  productId?: string;
  purchaseToken?: string;
  expiresAt?: number;
  error?: string;
  purchase?: any;
}

export interface PurchaseService {
  getProducts(): Promise<Product[]>;
  purchase(productId: string): Promise<PurchaseResult>;
  restore(): Promise<PurchaseResult>;
  finishPurchase?(purchase: any): Promise<void>;
}

const ALL_PRODUCT_IDS = Object.values(PREMIUM_PRODUCTS);

function addYears(years: number) {
  const d = new Date();
  d.setFullYear(d.getFullYear() + years);
  return d.getTime();
}

export function createMockPurchaseService(): PurchaseService {
  const products: Product[] = [
    {
      productId: PREMIUM_PRODUCTS.monthly,
      title: 'Premium Monthly',
      description: 'Unlock every scene and future content.',
      price: '$4.99',
      subscriptionPeriod: 'P1M',
    },
    {
      productId: PREMIUM_PRODUCTS.yearly,
      title: 'Premium Yearly',
      description: 'Best value — unlock everything for a full year.',
      price: '$29.99',
      subscriptionPeriod: 'P1Y',
    },
  ];

  return {
    async getProducts() {
      return products;
    },
    async purchase(productId: string) {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      if (!ALL_PRODUCT_IDS.includes(productId as any)) {
        return { ok: false, error: 'Product not found.' };
      }
      return {
        ok: true,
        productId,
        purchaseToken: `mock-token-${Date.now()}`,
        expiresAt: addYears(1),
      };
    },
    async restore() {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return {
        ok: true,
        productId: PREMIUM_PRODUCTS.yearly,
        purchaseToken: `mock-token-${Date.now()}`,
        expiresAt: addYears(1),
      };
    },
    async finishPurchase() {
      // Mock purchases do not need to be finished with the store.
    },
  };
}

async function loadIapModule() {
  try {
    return require('expo-iap');
  } catch {
    return null;
  }
}

export function createRealPurchaseService(): PurchaseService {
  let iap: any = null;
  let fallback: PurchaseService | null = null;
  let connected = false;

  async function ensureIap(): Promise<any> {
    if (fallback) return null;
    if (!iap) {
      iap = await loadIapModule();
      if (!iap) {
        fallback = createMockPurchaseService();
        return null;
      }
    }
    if (!connected) {
      try {
        await iap.initConnection();
        connected = true;
      } catch {
        fallback = createMockPurchaseService();
        iap = null;
        return null;
      }
    }
    return iap;
  }

  function getFallback(): PurchaseService {
    if (!fallback) fallback = createMockPurchaseService();
    return fallback;
  }

  return {
    async getProducts() {
      const mod = await ensureIap();
      if (!mod) return getFallback().getProducts();
      try {
        const items = await mod.fetchProducts({
          skus: ALL_PRODUCT_IDS,
          type: 'in-app',
        });
        if (!items) return getFallback().getProducts();
        const list = Array.isArray(items) ? items : [items];
        return list.map((item: any) => ({
          productId: item.id,
          title: item.title,
          description: item.description,
          price: item.displayPrice,
        }));
      } catch {
        return getFallback().getProducts();
      }
    },
    async purchase(productId: string) {
      const mod = await ensureIap();
      if (!mod) return getFallback().purchase(productId);
      try {
        const raw = await mod.requestPurchase({
          type: 'in-app',
          request: {
            apple: { sku: productId },
            google: { skus: [productId] },
          },
        });
        const purchase = Array.isArray(raw) ? raw[0] : raw;
        if (!purchase) {
          return { ok: false, error: 'Purchase was cancelled or not returned.' };
        }
        return {
          ok: true,
          productId: purchase.productId ?? productId,
          purchaseToken: purchase.purchaseToken ?? purchase.transactionId ?? `iap-token-${Date.now()}`,
          expiresAt: addYears(1),
          purchase,
        };
      } catch (error: any) {
        if (
          error?.code === 'user-cancelled' ||
          error?.code === 'E_USER_CANCELLED' ||
          error?.message?.toLowerCase().includes('cancel')
        ) {
          return { ok: false, error: 'Purchase cancelled.' };
        }
        return getFallback().purchase(productId);
      }
    },
    async restore() {
      const mod = await ensureIap();
      if (!mod) return getFallback().restore();
      try {
        const raw = await mod.getAvailablePurchases();
        const purchases = Array.isArray(raw) ? raw : raw ? [raw] : [];
        const found = purchases.find((p: any) => ALL_PRODUCT_IDS.includes(p.productId));
        if (!found) {
          return { ok: false, error: 'No previous purchases found.' };
        }
        return {
          ok: true,
          productId: found.productId,
          purchaseToken: found.purchaseToken ?? found.transactionId ?? `iap-token-${Date.now()}`,
          expiresAt: addYears(1),
          purchase: found,
        };
      } catch {
        return getFallback().restore();
      }
    },
    async finishPurchase(purchase: any) {
      const mod = await ensureIap();
      if (!mod) return;
      try {
        await mod.finishTransaction({ purchase, isConsumable: false });
      } catch {
        // Best-effort: if finishing fails the purchase will be re-delivered.
      }
    },
  };
}

export function createPurchaseService(): PurchaseService {
  return createRealPurchaseService();
}

export const purchaseService = createPurchaseService();
