// scripts/agent/tools.ts
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'child_process';
import type { AgentTool } from './types.js';

/** 项目根目录（根据实际情况调整） */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

/** 允许 Agent 操作的目录白名单 */
const ALLOWED_DIRS = [path.join(PROJECT_ROOT, 'src'), path.join(PROJECT_ROOT, 'scripts')];

/**
 * 安全检查：确保文件路径在白名单内
 * 防止 AI 误操作项目外的文件
 */
function isPathAllowed(filePath: string): boolean {
  const absolutePath = path.resolve(PROJECT_ROOT, filePath);
  return ALLOWED_DIRS.some((dir) => absolutePath.startsWith(dir));
}

// ============================================================
// 工具 1：读取文件
// ============================================================
export const readFileTool: AgentTool = {
  name: 'read_file',
  description: '读取项目中的文件内容。当需要查看某个文件的完整代码时使用。',
  parameters: {
    type: 'object',
    properties: {
      filePath: {
        type: 'string',
        description: '相对于项目根目录的文件路径，例如 src/utils/retry.ts',
      },
    },
    required: ['filePath'],
  },
  execute: async (args) => {
    const filePath = args.filePath as string;

    if (!isPathAllowed(filePath)) {
      return `❌ 安全限制：不允许访问 ${filePath}（只允许访问 src/ 和 scripts/ 目录）`;
    }

    const absolutePath = path.resolve(PROJECT_ROOT, filePath);
    if (!fs.existsSync(absolutePath)) {
      return `❌ 文件不存在: ${filePath}`;
    }

    const content = fs.readFileSync(absolutePath, 'utf-8');
    // 限制返回长度，防止撑爆 context
    const maxLength = 5000;
    if (content.length > maxLength) {
      return content.slice(0, maxLength) + `\n...（内容过长，已截断，共 ${content.length} 字符）`;
    }
    return content;
  },
};

// ============================================================
// 工具 2：写入文件
// ============================================================
export const writeFileTool: AgentTool = {
  name: 'write_file',
  description: '将内容写入项目中的文件。用于修复代码。会覆盖原文件内容。',
  parameters: {
    type: 'object',
    properties: {
      filePath: {
        type: 'string',
        description: '相对于项目根目录的文件路径',
      },
      content: {
        type: 'string',
        description: '要写入的完整文件内容',
      },
    },
    required: ['filePath', 'content'],
  },
  execute: async (args) => {
    const filePath = args.filePath as string;
    const content = args.content as string;

    if (!isPathAllowed(filePath)) {
      return `❌ 安全限制：不允许修改 ${filePath}`;
    }

    const absolutePath = path.resolve(PROJECT_ROOT, filePath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, content, 'utf-8');
    return `✅ 已写入文件: ${filePath}（${content.length} 字符）`;
  },
};

// ============================================================
// 工具 3：运行 ESLint
// ============================================================
export const runLintTool: AgentTool = {
  name: 'run_lint',
  description: '对指定文件运行 ESLint 检查。返回检查结果（如果有错误会显示错误详情）。',
  parameters: {
    type: 'object',
    properties: {
      filePath: {
        type: 'string',
        description: '要检查的文件路径。不传则检查整个 src 目录。',
      },
    },
    required: [],
  },
  execute: async (args) => {
    const filePath = args.filePath as string | undefined;
    const target = filePath || 'src';
    try {
      const result = execSync(`pnpm exec eslint ${target} --ext .vue,.js,.ts`, {
        cwd: PROJECT_ROOT,
        encoding: 'utf-8',
        timeout: 60000,
      });
      return result || '✅ ESLint 检查通过，没有发现问题';
    } catch (error) {
      // ESLint 有错误时会抛异常，错误信息在 stdout/stderr 中
      const err = error as { stdout?: string; stderr?: string };
      return `❌ ESLint 发现问题：\n${err.stdout || err.stderr || '未知错误'}`;
    }
  },
};

// ============================================================
// 工具 4：自动修复 ESLint
// ============================================================
export const fixLintTool: AgentTool = {
  name: 'fix_lint',
  description: '对指定文件运行 ESLint 自动修复（--fix）。能修复格式问题（缩进、引号、分号等）。',
  parameters: {
    type: 'object',
    properties: {
      filePath: {
        type: 'string',
        description: '要修复的文件路径',
      },
    },
    required: ['filePath'],
  },
  execute: async (args) => {
    const filePath = args.filePath as string;
    try {
      execSync(`pnpm exec eslint ${filePath} --fix`, {
        cwd: PROJECT_ROOT,
        encoding: 'utf-8',
        timeout: 60000,
      });
      return `✅ 已自动修复: ${filePath}`;
    } catch (error) {
      const err = error as { stdout?: string; stderr?: string };
      return `⚠️ 自动修复后仍存在问题：\n${err.stdout || err.stderr || '未知错误'}`;
    }
  },
};

// ============================================================
// 工具 5：运行测试
// ============================================================
export const runTestTool: AgentTool = {
  name: 'run_test',
  description: '运行 Vitest 单元测试。返回测试结果。',
  parameters: {
    type: 'object',
    properties: {
      filePath: {
        type: 'string',
        description: '要测试的文件路径。不传则运行全部测试。',
      },
    },
    required: [],
  },
  execute: async (args) => {
    const filePath = args.filePath as string | undefined;
    const cmd = filePath ? `pnpm test ${filePath}` : 'pnpm test';
    try {
      const result = execSync(cmd, {
        cwd: PROJECT_ROOT,
        encoding: 'utf-8',
        timeout: 120000,
      });
      return `✅ 测试通过：\n${result.slice(0, 2000)}`;
    } catch (error) {
      const err = error as { stdout?: string; stderr?: string };
      return `❌ 测试失败：\n${(err.stdout || err.stderr || '').slice(0, 2000)}`;
    }
  },
};

// ============================================================
// 工具 6：查询知识图谱影响范围
// ============================================================
export const queryImpactTool: AgentTool = {
  name: 'query_impact',
  description: '查询知识图谱，获取某个文件改动会影响哪些文件。',
  parameters: {
    type: 'object',
    properties: {
      filePath: {
        type: 'string',
        description: '要查询的文件路径',
      },
    },
    required: ['filePath'],
  },
  execute: async (args) => {
    const filePath = args.filePath as string;
    const graphPath = path.resolve(PROJECT_ROOT, 'knowledge-graph.json');
    if (!fs.existsSync(graphPath)) {
      return '❌ 知识图谱不存在，请先运行 pnpm graph';
    }

    const graph = JSON.parse(fs.readFileSync(graphPath, 'utf-8'));
    const impacted: string[] = [];

    for (const edge of graph.edges || []) {
      const from = (edge.from || '').replace(/^file:/, '');
      const to = (edge.to || '').replace(/^file:/, '');
      if (to === filePath || to.endsWith(filePath)) {
        impacted.push(from);
      }
    }

    if (impacted.length === 0) {
      return `📊 ${filePath} 没有被其他文件依赖`;
    }
    return `📊 ${filePath} 被以下 ${impacted.length} 个文件依赖：\n${impacted.map((f) => `  - ${f}`).join('\n')}`;
  },
};

// ============================================================
// 工具 7：Git 操作（只读，安全）
// ============================================================
export const gitDiffTool: AgentTool = {
  name: 'git_diff',
  description: '获取当前的 Git 改动内容。',
  parameters: {
    type: 'object',
    properties: {
      staged: {
        type: 'boolean',
        description: '是否只看已暂存的改动',
      },
    },
    required: [],
  },
  execute: async (args) => {
    const staged = args.staged as boolean | undefined;
    const cmd = staged ? 'git diff --cached' : 'git diff HEAD';
    try {
      const result = execSync(cmd, {
        cwd: PROJECT_ROOT,
        encoding: 'utf-8',
        timeout: 10000,
      });
      return result || '✅ 没有检测到改动';
    } catch {
      return '❌ Git diff 失败';
    }
  },
};

// ============================================================
// 工具集导出
// ============================================================
export const allTools: AgentTool[] = [
  readFileTool,
  writeFileTool,
  runLintTool,
  fixLintTool,
  runTestTool,
  queryImpactTool,
  gitDiffTool,
];

/** 工具名到工具的映射，用于执行器快速查找 */
export const toolMap = new Map(allTools.map((t) => [t.name, t]));
