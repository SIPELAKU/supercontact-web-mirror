import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { startPolling } from './usePolling';

const visible = () => false;

describe('startPolling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('ticks once per interval, first after one interval, until stopped', async () => {
    const tick = vi.fn();
    const stop = startPolling({ intervalMs: 5000, tick, isHidden: visible });

    await vi.advanceTimersByTimeAsync(4999);
    expect(tick).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(tick).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(10000);
    expect(tick).toHaveBeenCalledTimes(3);

    stop();
    await vi.advanceTimersByTimeAsync(20000);
    expect(tick).toHaveBeenCalledTimes(3);
  });

  it('off (false or 0): never ticks', async () => {
    const tick = vi.fn();
    const stops = [
      startPolling({ intervalMs: false, tick, isHidden: visible }),
      startPolling({ intervalMs: 0, tick, isHidden: visible }),
    ];
    await vi.advanceTimersByTimeAsync(60000);
    expect(tick).not.toHaveBeenCalled();
    stops.forEach((stop) => stop());
  });

  it('skips ticks while the previous one is still running - requests never stack', async () => {
    let finish = () => {};
    const tick = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        })
    );
    const stop = startPolling({ intervalMs: 1000, tick, isHidden: visible });

    // A slow request spanning three more intervals.
    await vi.advanceTimersByTimeAsync(3500);
    expect(tick).toHaveBeenCalledTimes(1);

    finish();
    await vi.advanceTimersByTimeAsync(500);
    expect(tick).toHaveBeenCalledTimes(2);
    stop();
  });

  it('skips while the tab is hidden and picks up again when it is shown', async () => {
    let hidden = true;
    const tick = vi.fn();
    const stop = startPolling({ intervalMs: 1000, tick, isHidden: () => hidden });

    await vi.advanceTimersByTimeAsync(5000);
    expect(tick).not.toHaveBeenCalled();

    hidden = false;
    await vi.advanceTimersByTimeAsync(1000);
    expect(tick).toHaveBeenCalledTimes(1);
    stop();
  });

  it('a failed tick does not stop the polling', async () => {
    const tick = vi.fn().mockRejectedValueOnce(new Error('down')).mockResolvedValue(undefined);
    const stop = startPolling({ intervalMs: 1000, tick, isHidden: visible });

    await vi.advanceTimersByTimeAsync(3000);
    expect(tick).toHaveBeenCalledTimes(3);
    stop();
  });
});
