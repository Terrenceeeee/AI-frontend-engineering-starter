// src/types/vconsole.d.ts

declare module 'vconsole' {
  export default class VConsole {
    constructor(options?: {
      theme?: 'light' | 'dark';
      maxLogNumber?: number;
      onReady?: () => void;
    });
    show(): void;
    hide(): void;
    destroy(): void;
    setSwitchPosition(x: number, y: number): void;
  }
}