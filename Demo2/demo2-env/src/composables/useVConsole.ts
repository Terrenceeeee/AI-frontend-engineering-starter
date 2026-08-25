// src/composables/useVConsole.ts
// Vue3 Composable 组合式函数：封装 vConsole 动态懒加载、销毁、显示隐藏逻辑
// 采用动态 import() 按需加载，不在首屏打包引入，减少初始资源体积

// 仅导入类型，编译后消除，不产生运行代码
import type VConsole from 'vconsole';

/**
 * vConsole 状态对象类型
 */
interface VConsoleState {
  // 是否已完成加载并实例化
  loaded: boolean;
  // 是否正在加载中（防止并发重复加载）
  loading: boolean;
  // 加载错误信息，无错误为 null
  error: string | null;
}

/**
 * vConsole 封装组合式函数
 * @returns 状态与操作方法
 */
export function useVConsole() {
  // 内部状态，记录加载流程
  const state: VConsoleState = {
    loaded: false,
    loading: false,
    error: null,
  };

  /**
   * 异步加载 & 初始化 vConsole
   * 支持并发调用防抖，避免多次重复实例化
   * @returns vConsole实例 / null（加载失败）
   */
  async function load(): Promise<VConsole | null> {
    // 场景1：已经加载完成，直接返回全局实例
    if (state.loaded) return window.vConsole || null;

    // 场景2：正在加载中，创建轮询等待，避免并发多次import
    if (state.loading) {
      return new Promise((resolve) => {
        // 每100ms轮询一次加载状态
        const check = setInterval(() => {
          // loading 变为 false 代表加载流程结束（成功/失败）
          if (!state.loading) {
            clearInterval(check);
            resolve(window.vConsole || null);
          }
        }, 100);
      });
    }

    // 标记进入加载流程
    state.loading = true;
    // 清空上一次错误信息
    state.error = null;

    try {
      // 动态导入：按需加载vconsole，实现代码分割
      const module = await import('vconsole');
      // 实例化 vConsole，传入初始化配置
      const instance = new module.default({
        theme: 'light', // 浅色主题
        maxLogNumber: 1000, // 面板最大日志缓存数量
      });
      // 挂载到全局window，方便项目任意位置访问
      window.vConsole = instance;
      // 全局标记：已加载
      window.__vConsoleLoaded = true;
      // 更新本地状态
      state.loaded = true;
      state.loading = false;
      console.log('[useVConsole] ✅ vConsole 已加载');
      return instance;
    } catch (error) {
      // 加载异常处理（CDN/打包缺失、模块加载失败等）
      state.loading = false;
      // 兼容错误类型，提取错误文本
      state.error = error instanceof Error ? error.message : '加载失败';
      console.error('[useVConsole] ❌ 加载失败:', error);
      return null;
    }
  }

  /**
   * 销毁 vConsole 实例，清理全局变量
   */
  function destroy(): void {
    if (window.vConsole) {
      try {
        // 调用vConsole原生销毁方法，移除DOM、解绑事件
        window.vConsole.destroy();
      } catch {
        /* 捕获销毁时可能出现的异常，不阻断业务 */
      }
      // 清空全局实例
      window.vConsole = undefined;
      window.__vConsoleLoaded = false;
      // 重置内部状态
      state.loaded = false;
      state.error = null;
      console.log('[useVConsole] vConsole 已销毁');
    }
  }

  /**
   * 切换 vConsole 面板显示/隐藏
   * 思路：通过DOM样式判断当前面板状态，反向调用show/hide
   */
  function toggle(): void {
    // 没有实例直接警告返回
    if (!window.vConsole) {
      console.warn('[useVConsole] vConsole 未加载');
      return;
    }
    try {
      // 获取vConsole根DOM节点
      const panel = document.querySelector('#__vconsole');
      // 判断面板是否处于隐藏状态（display: none）
      if (panel?.getAttribute('style')?.includes('display: none')) {
        window.vConsole.show();
      } else {
        window.vConsole.hide();
      }
    } catch (error) {
      console.warn('[useVConsole] 切换面板失败:', error);
    }
  }

  // 向外暴露状态与方法
  return { state, load, destroy, toggle };
}
