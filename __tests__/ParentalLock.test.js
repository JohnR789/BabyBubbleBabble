import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import ParentalLock from '../components/ParentalLock';

function findPressable(root) {
  return root.findAll(node => typeof node.props.onPress === 'function')[0];
}

describe('ParentalLock', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('unlocks only after 5 taps', () => {
    const onUnlock = jest.fn();
    let tree;
    act(() => {
      tree = ReactTestRenderer.create(<ParentalLock onUnlock={onUnlock} />);
    });
    const pressable = findPressable(tree.root);

    for (let i = 0; i < 4; i++) {
      act(() => pressable.props.onPress());
    }
    expect(onUnlock).not.toHaveBeenCalled();

    act(() => pressable.props.onPress());
    expect(onUnlock).toHaveBeenCalledTimes(1);
  });

  it('resets the tap count after the timeout window', () => {
    const onUnlock = jest.fn();
    let tree;
    act(() => {
      tree = ReactTestRenderer.create(<ParentalLock onUnlock={onUnlock} />);
    });
    const pressable = findPressable(tree.root);

    for (let i = 0; i < 4; i++) {
      act(() => pressable.props.onPress());
    }
    act(() => jest.advanceTimersByTime(3000));

    // Count was reset, so one more tap should not unlock.
    act(() => pressable.props.onPress());
    expect(onUnlock).not.toHaveBeenCalled();
  });
});
