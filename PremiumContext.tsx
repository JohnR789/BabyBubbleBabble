import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { purchaseService } from './services/purchase';

const STORAGE_KEY = '@BBB:premium';

export type PremiumStatus = 'idle' | 'loading' | 'purchased' | 'expired' | 'error';

export interface PremiumState {
  isPremium: boolean;
  status: PremiumStatus;
  expiresAt: number | null;
  productId: string | null;
  purchaseToken: string | null;
  error: string | null;
}

interface PremiumContextValue extends PremiumState {
  purchase: (productId: string) => Promise<void>;
  restore: () => Promise<void>;
  activateTrial: (days?: number) => void;
  deactivate: () => void;
  clearError: () => void;
}

const defaultState: PremiumState = {
  isPremium: false,
  status: 'idle',
  expiresAt: null,
  productId: null,
  purchaseToken: null,
  error: null,
};

const PremiumContext = createContext<PremiumContextValue>({
  ...defaultState,
  purchase: async () => {},
  restore: async () => {},
  activateTrial: () => {},
  deactivate: () => {},
  clearError: () => {},
});

function isActive(state: PremiumState) {
  if (!state.purchaseToken && !state.expiresAt) return false;
  if (state.expiresAt && state.expiresAt <= Date.now()) return false;
  return true;
}

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PremiumState>(defaultState);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!mounted || !raw) return;
        const parsed = JSON.parse(raw) as Partial<PremiumState>;
        const next = { ...defaultState, ...parsed };
        setState({ ...next, isPremium: isActive(next), status: 'idle' });
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) {
          setState((prev) => (prev.status === 'loading' ? { ...prev, status: 'idle' } : prev));
        }
      });
    return () => { mounted = false; };
  }, []);

  const persist = useCallback((next: PremiumState) => {
    setState(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const purchase = useCallback(
    async (productId: string) => {
      setState((prev) => ({ ...prev, status: 'loading', error: null }));
      try {
        const result = await purchaseService.purchase(productId);
        if (result.ok) {
          const next: PremiumState = {
            isPremium: true,
            status: 'purchased',
            expiresAt: result.expiresAt ?? null,
            productId: result.productId ?? productId,
            purchaseToken: result.purchaseToken ?? null,
            error: null,
          };
          persist(next);
        } else {
          setState((prev) => ({
            ...prev,
            isPremium: isActive(prev),
            status: 'error',
            error: result.error ?? 'Purchase could not be completed.',
          }));
        }
      } catch {
        setState((prev) => ({
          ...prev,
          isPremium: isActive(prev),
          status: 'error',
          error: 'Purchase failed. Please try again.',
        }));
      }
    },
    [persist],
  );

  const restore = useCallback(async () => {
    setState((prev) => ({ ...prev, status: 'loading', error: null }));
    try {
      const result = await purchaseService.restore();
      if (result.ok) {
        const next: PremiumState = {
          isPremium: true,
          status: 'purchased',
          expiresAt: result.expiresAt ?? null,
          productId: result.productId ?? null,
          purchaseToken: result.purchaseToken ?? null,
          error: null,
        };
        persist(next);
      } else {
        setState((prev) => ({
          ...prev,
          isPremium: isActive(prev),
          status: 'error',
          error: result.error ?? 'Could not restore purchases.',
        }));
      }
    } catch {
      setState((prev) => ({
        ...prev,
        isPremium: isActive(prev),
        status: 'error',
        error: 'Restore failed. Please try again.',
      }));
    }
  }, [persist]);

  const activateTrial = useCallback(
    (days = 7) => {
      const expiresAt = Date.now() + days * 24 * 60 * 60 * 1000;
      persist({
        isPremium: true,
        status: 'purchased',
        expiresAt,
        productId: 'trial',
        purchaseToken: `trial-${Date.now()}`,
        error: null,
      });
    },
    [persist],
  );

  const deactivate = useCallback(() => {
    persist({
      ...defaultState,
      status: 'idle',
    });
  }, [persist]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null, status: prev.status === 'error' ? 'idle' : prev.status }));
  }, []);

  const value = useMemo(
    () => ({ ...state, purchase, restore, activateTrial, deactivate, clearError }),
    [state, purchase, restore, activateTrial, deactivate, clearError],
  );

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
}

export function usePremium(): PremiumContextValue {
  return useContext(PremiumContext);
}
