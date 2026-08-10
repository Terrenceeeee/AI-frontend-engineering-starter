// src/types/global.d.ts

import type VConsole from 'vconsole';

declare global {
  interface Window {
    vConsole?: VConsole;
    __vConsoleLoaded?: boolean;
  }
}

export {};