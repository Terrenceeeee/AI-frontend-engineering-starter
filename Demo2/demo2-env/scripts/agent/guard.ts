// scripts/agent/guard.ts
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import type { ToolExecutionResult } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PROJECT_ROOT = path.resolve(__dirname, '../..');

const ALLOWED_READ_DIRS = [path.join(PROJECT_ROOT, 'src'), path.join(PROJECT_ROOT, 'scripts')];
const ALLOWED_WRITE_DIRS = [path.join(PROJECT_ROOT, 'src'), path.join(PROJECT_ROOT, 'scripts')];

const BLOCKED_WRITE_PATHS = [
  'package.json',
  'pnpm-lock.yaml',
  'vite.config.ts',
  'tsconfig.json',
  '.env',
  '.github',
  'scripts/agent',
];

export function normalizeProjectPath(filePath: string): string {
  return filePath.replace(/\\/g, '/').replace(/^\.?\//, '');
}

function isInside(parent: string, child: string): boolean {
  const relative = path.relative(parent, child);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

export function resolveProjectPath(filePath: string): string {
  return path.resolve(PROJECT_ROOT, filePath);
}

export function isReadablePath(filePath: string): boolean {
  const absolutePath = resolveProjectPath(filePath);
  return ALLOWED_READ_DIRS.some((dir) => isInside(dir, absolutePath));
}

export function isWritablePath(filePath: string): boolean {
  const normalized = normalizeProjectPath(filePath);
  const absolutePath = resolveProjectPath(filePath);

  if (!ALLOWED_WRITE_DIRS.some((dir) => isInside(dir, absolutePath))) {
    return false;
  }

  return !BLOCKED_WRITE_PATHS.some((blocked) => {
    const normalizedBlocked = normalizeProjectPath(blocked);
    return normalized === normalizedBlocked || normalized.startsWith(`${normalizedBlocked}/`);
  });
}

export function assertReadablePath(filePath: string): ToolExecutionResult | null {
  if (!isReadablePath(filePath)) {
    return {
      success: false,
      message: `安全限制：不允许读取 ${filePath}。只允许读取 src/ 和 scripts/。`,
    };
  }

  if (!fs.existsSync(resolveProjectPath(filePath))) {
    return {
      success: false,
      message: `文件不存在：${filePath}`,
    };
  }

  return null;
}

export function assertWritablePath(filePath: string): ToolExecutionResult | null {
  if (!isWritablePath(filePath)) {
    return {
      success: false,
      message: `安全限制：不允许修改 ${filePath}。Agent 只能修改 src/ 与 scripts/ 下的非 Agent 核心文件。`,
    };
  }

  return null;
}

export function getPnpmCommand(): string {
  return process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
}

export function runCommand(
  command: string,
  args: string[],
  options: { timeout?: number; maxOutput?: number } = {}
): ToolExecutionResult {
  const { timeout = 60_000, maxOutput = 6000 } = options;

  try {
    const stdout = execFileSync(command, args, {
      cwd: PROJECT_ROOT,
      encoding: 'utf-8',
      timeout,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    return formatCommandResult({
      success: true,
      message: '命令执行成功',
      stdout,
      exitCode: 0,
      maxOutput,
    });
  } catch (error) {
    const err = error as {
      status?: number;
      stdout?: Buffer | string;
      stderr?: Buffer | string;
      message?: string;
    };

    return formatCommandResult({
      success: false,
      message: '命令执行失败',
      stdout: toStringOutput(err.stdout),
      stderr: toStringOutput(err.stderr) || err.message,
      exitCode: err.status,
      maxOutput,
    });
  }
}

function toStringOutput(output: Buffer | string | undefined): string {
  if (!output) return '';
  return Buffer.isBuffer(output) ? output.toString('utf-8') : output;
}

function formatCommandResult(
  result: ToolExecutionResult & { maxOutput: number }
): ToolExecutionResult {
  const combined = [result.stdout, result.stderr].filter(Boolean).join('\n');

  if (combined.length <= result.maxOutput) {
    return result;
  }

  const head = combined.slice(0, Math.floor(result.maxOutput * 0.65));
  const tail = combined.slice(-Math.floor(result.maxOutput * 0.35));

  return {
    ...result,
    stdout: `${head}\n...（输出过长，保留开头和结尾）...\n${tail}`,
    stderr: undefined,
    truncated: true,
  };
}

export function stringifyToolResult(result: ToolExecutionResult): string {
  const status = result.success ? '✅' : '❌';
  const parts = [`${status} ${result.message}`];

  if (typeof result.exitCode === 'number' && result.exitCode !== 0) {
    parts.push(`退出码：${result.exitCode}`);
  }

  if (result.stdout) {
    parts.push(`stdout:\n${result.stdout}`);
  }

  if (result.stderr) {
    parts.push(`stderr:\n${result.stderr}`);
  }

  if (result.truncated) {
    parts.push('提示：输出已截断。');
  }

  return parts.join('\n\n');
}
