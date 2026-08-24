// src/types/global.d.ts

/// <reference types="vite/client" />

import type VConsole from 'vconsole';

declare global {
  interface Window {
    vConsole?: VConsole;
    __vConsoleLoaded?: boolean;
  }
}

export {};
