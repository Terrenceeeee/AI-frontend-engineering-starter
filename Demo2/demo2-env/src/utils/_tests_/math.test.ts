// src/utils/__tests__/math.test.ts
import { describe, it, expect } from 'vitest';

// 一个简单的加法函数（直接写在测试里，不用单独建文件）
function add(a: number, b: number): number {
  return a + b;
}

describe('add 函数', () => {
  it('1 + 2 应该等于 3', () => {
    expect(add(1, 2)).toBe(3);
  });

  it('-1 + 1 应该等于 0', () => {
    expect(add(-1, 1)).toBe(0);
  });
});
