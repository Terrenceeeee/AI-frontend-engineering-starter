import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { RequestPool } from '../requestPool';

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

describe('RequestPool', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('limits concurrent requests and starts queued requests after a slot is released', async () => {
    const pool = new RequestPool(2);
    const first = createDeferred<string>();
    const second = createDeferred<string>();
    const third = createDeferred<string>();

    const tasks = [
      vi.fn(() => first.promise),
      vi.fn(() => second.promise),
      vi.fn(() => third.promise),
    ];

    const results = tasks.map((task) => pool.request(task));

    await Promise.resolve();

    expect(tasks[0]).toHaveBeenCalledTimes(1);
    expect(tasks[1]).toHaveBeenCalledTimes(1);
    expect(tasks[2]).not.toHaveBeenCalled();

    first.resolve('first');
    await Promise.resolve();
    await Promise.resolve();

    expect(tasks[2]).toHaveBeenCalledTimes(1);

    second.resolve('second');
    third.resolve('third');

    await expect(Promise.all(results)).resolves.toEqual(['first', 'second', 'third']);
  });

  it('releases a slot even when a request fails', async () => {
    const pool = new RequestPool(1);
    const failing = createDeferred<string>();
    const next = createDeferred<string>();

    const failingTask = vi.fn(() => failing.promise);
    const nextTask = vi.fn(() => next.promise);

    const failingResult = pool.request(failingTask);
    const nextResult = pool.request(nextTask);

    await Promise.resolve();
    expect(nextTask).not.toHaveBeenCalled();

    failing.reject(new Error('boom'));
    await expect(failingResult).rejects.toThrow('boom');
    await Promise.resolve();

    expect(nextTask).toHaveBeenCalledTimes(1);

    next.resolve('next');
    await expect(nextResult).resolves.toBe('next');
  });
});
