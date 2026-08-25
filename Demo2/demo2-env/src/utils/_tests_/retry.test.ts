import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { retryWithBackoff } from '../retry';

describe('retryWithBackoff', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('retries retryable errors and returns the eventual result', async () => {
    const retryableError = { response: { status: 500 } };
    const fn = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(retryableError)
      .mockResolvedValueOnce('ok');

    const promise = retryWithBackoff(fn, { maxRetries: 2, baseDelay: 100 });

    await vi.advanceTimersByTimeAsync(100);

    await expect(promise).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('throws immediately when shouldRetry returns false', async () => {
    const error = new Error('validation failed');
    const fn = vi.fn<() => Promise<string>>().mockRejectedValue(error);

    await expect(
      retryWithBackoff(fn, {
        maxRetries: 3,
        shouldRetry: () => false,
      })
    ).rejects.toThrow('validation failed');

    expect(fn).toHaveBeenCalledTimes(1);
  });
});
