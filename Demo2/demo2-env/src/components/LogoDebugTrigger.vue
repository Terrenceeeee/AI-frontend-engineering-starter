<template>
  <div class="logo-debug-trigger" @click="handleClick" @keydown.enter="handleClick" role="button" tabindex="0">
    <slot>
      <span style="font-size: 24px;">🚀</span>
      <span style="font-size: 14px; color: #888;">
        {{ remainingClicks > 0 ? `点击 ${remainingClicks} 次` : '✨ 已触发' }}
      </span>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useVConsole } from '@/composables/useVConsole';

const props = withDefaults(
  defineProps<{
    clickCount?: number;
    timeout?: number;
    autoLoad?: boolean;
  }>(),
  {
    clickCount: 5,
    timeout: 2000,
    autoLoad: true,
  }
);

const emit = defineEmits<{
  (e: 'trigger'): void;
  (e: 'load-success'): void;
  (e: 'load-error', error: string): void;
}>();

const clickCount = ref(0);
const remainingClicks = ref(props.clickCount);
let clickTimer: ReturnType<typeof setTimeout> | null = null;
const { load } = useVConsole();

function handleClick(): void {
  clickCount.value++;
  remainingClicks.value = props.clickCount - clickCount.value;

  if (clickTimer) {
    clearTimeout(clickTimer);
    clickTimer = null;
  }

  if (clickCount.value >= props.clickCount) {
    clickCount.value = 0;
    remainingClicks.value = props.clickCount;
    emit('trigger');
    if (props.autoLoad) {
      loadVConsole();
    }
    return;
  }

  clickTimer = setTimeout(() => {
    clickCount.value = 0;
    remainingClicks.value = props.clickCount;
    console.log('[LogoDebugTrigger] 点击超时，已重置计数');
  }, props.timeout);
}

async function loadVConsole(): Promise<void> {
  const instance = await load();
  if (instance) {
    emit('load-success');
    showFeedback('🔧 调试面板已开启！', 'success');
  } else {
    emit('load-error', '加载失败');
    showFeedback('❌ 调试面板加载失败', 'error');
  }
}

function showFeedback(message: string, type: 'success' | 'error'): void {
  const color = type === 'success' ? '#42b883' : '#d9534f';
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 24px;
    background: ${color};
    color: white;
    border-radius: 8px;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    z-index: 99999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    animation: fadeInUp 0.3s ease;
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => {
      if (toast.parentNode) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

onMounted(() => {
  if (window.__vConsoleLoaded) {
    remainingClicks.value = 0;
  }
});

onUnmounted(() => {
  if (clickTimer) {
    clearTimeout(clickTimer);
    clickTimer = null;
  }
});
</script>

<style scoped>
.logo-debug-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 2px dashed #42b883;
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
}

.logo-debug-trigger:hover {
  background: rgba(66, 184, 131, 0.1);
  transform: scale(1.02);
}

.logo-debug-trigger:active {
  transform: scale(0.95);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>