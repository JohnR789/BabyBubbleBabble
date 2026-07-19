/**
 * Purchase service abstraction.
 *
 * The app ships with a mock provider so it is testable and buildable without
 * store credentials or native billing setup. In production this can be swapped
 * for a real provider (expo-iap, react-native-purchases/RevenueCat, etc.).
 */

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
}

export interface PurchaseService {
  getProducts(): Promise<Product[]>;
  purchase(productId: string): Promise<PurchaseResult>;
  restore(): Promise<PurchaseResult>;
}

const PRODUCTS: Product[] = [
  {
    productId: 'com.babybubblebabble.premium.monthly',
    title: 'Premium Monthly',
    description: 'Unlock every scene and future content.',
    price: '$4.99',
    subscriptionPeriod: 'P1M',
  },
  {
    productId: 'com.babybubblebabble.premium.yearly',
    title: 'Premium Yearly',
    description: 'Best value — unlock everything for a full year.',
    price: '$29.99',
    subscriptionPeriod: 'P1Y',
  },
];

function addDays(days: number) {
  return Date.now() + days * 24 * 60 * 60 * 1000;
}

export function createMockPurchaseService(): PurchaseService {
  return {
    async getProducts() {
      return PRODUCTS;
    },
    async purchase(productId: string) {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      if (!PRODUCTS.some((p) => p.productId === productId)) {
        return { ok: false, error: 'Product not found.' };
      }
      return {
        ok: true,
        productId,
        purchaseToken: `mock-token-${Date.now()}`,
        expiresAt: addDays(365),
      };
    },
    async restore() {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return {
        ok: true,
        productId: PRODUCTS[1].productId,
        purchaseToken: `mock-token-${Date.now()}`,
        expiresAt: addDays(365),
      };
    },
  };
}

export const purchaseService = createMockPurchaseService();
