import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearLogs, exportLogs, getLogCount, isPaymentError, logError } from '../logger';

describe('logger', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    clearLogs();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('stores errors, exports formatted logs, and respects maxLogs', () => {
    logError('first error', new Error('first'), { maxLogs: 1 });
    logError('second error', { code: 'SECOND' }, { maxLogs: 1 });

    expect(getLogCount()).toBe(1);

    const logs = JSON.parse(exportLogs()) as Array<{ msg: string; data: unknown }>;
    expect(logs).toHaveLength(1);
    expect(logs[0].msg).toBe('second error');
    expect(logs[0].data).toEqual({ code: 'SECOND' });
  });

  it('clears logs and detects payment error shape', () => {
    logError('payment failed', { code: 'TIMEOUT', message: 'timeout' });

    expect(getLogCount()).toBe(1);
    expect(isPaymentError({ code: 'TIMEOUT', message: 'timeout' })).toBe(true);
    expect(isPaymentError({ code: 500, message: 'timeout' })).toBe(false);

    clearLogs();

    expect(getLogCount()).toBe(0);
    expect(exportLogs()).toBe('暂无日志');
  });
});
