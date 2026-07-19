import React, { useEffect } from 'react';
import { Text } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { PremiumProvider, usePremium } from '../PremiumContext';
import { PREMIUM_PRODUCTS } from '../constants';

interface ProbeProps {
  onValue: (value: ReturnType<typeof usePremium>) => void;
}

function Probe({ onValue }: ProbeProps) {
  const premium = usePremium();
  useEffect(() => {
    onValue(premium);
  }, [premium, onValue]);
  return <Text>{premium.isPremium ? 'premium' : 'free'}</Text>;
}

function setup() {
  const ref = { current: null as ReturnType<typeof usePremium> | null };
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  const render = async () => {
    await act(async () => {
      tree = ReactTestRenderer.create(
        <PremiumProvider>
          <Probe onValue={(v) => { ref.current = v; }} />
        </PremiumProvider>,
      );
    });
    return tree;
  };
  return { ref, render };
}

describe('PremiumContext', () => {
  it('starts in a free state', async () => {
    const { ref, render } = setup();
    await render();
    expect(ref.current?.isPremium).toBe(false);
    expect(ref.current?.status).toBe('idle');
  });

  it('activates a trial', async () => {
    const { ref, render } = setup();
    await render();
    await act(async () => {
      ref.current?.activateTrial(7);
    });
    expect(ref.current?.isPremium).toBe(true);
    expect(ref.current?.status).toBe('purchased');
    expect(ref.current?.productId).toBe('trial');
    expect(ref.current?.expiresAt).toBeGreaterThan(Date.now());
  });

  it('purchases the monthly product using the mock service', async () => {
    const { ref, render } = setup();
    await render();
    await act(async () => {
      await ref.current?.purchase(PREMIUM_PRODUCTS.monthly);
    });
    expect(ref.current?.isPremium).toBe(true);
    expect(ref.current?.status).toBe('purchased');
    expect(ref.current?.productId).toBe(PREMIUM_PRODUCTS.monthly);
    expect(ref.current?.purchaseToken).toContain('mock-token');
  });

  it('restores purchases using the mock service', async () => {
    const { ref, render } = setup();
    await render();
    await act(async () => {
      await ref.current?.restore();
    });
    expect(ref.current?.isPremium).toBe(true);
    expect(ref.current?.status).toBe('purchased');
    expect(ref.current?.purchaseToken).toContain('mock-token');
  });

  it('can be deactivated', async () => {
    const { ref, render } = setup();
    await render();
    await act(async () => {
      ref.current?.activateTrial(7);
    });
    expect(ref.current?.isPremium).toBe(true);
    await act(async () => {
      ref.current?.deactivate();
    });
    expect(ref.current?.isPremium).toBe(false);
    expect(ref.current?.status).toBe('idle');
    expect(ref.current?.purchaseToken).toBeNull();
  });
});
