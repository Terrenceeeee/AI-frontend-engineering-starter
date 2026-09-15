// scripts/agent/tools.ts
import fs from 'node:fs';
import path from 'node:path';
import {
  assertReadablePath,
  assertWritablePath,
  getPnpmCommand,
  normalizeProjectPath,
  PROJECT_ROOT,
  resolveProjectPath,
  runCommand,
  stringifyToolResult,
} from './guard.js';
import type { AgentTool, ToolExecutionResult } from './types.js';

interface GraphNode {
  id: string;
  type: string;
  name: string;
  filePath: string;
}

interface GraphEdge {
  from: string;
  to: string;
  type: string;
}

interface KnowledgeGraph {
  nodes?: GraphNode[];
  edges?: GraphEdge[];
}

const pnpm = getPnpmCommand();

function resultToString(result: ToolExecutionResult): string {
  return stringifyToolResult(result);
}

function getOptionalFilePath(args: Record<string, unknown>): string | undefined {
  const filePath = args.filePath;
  return typeof filePath === 'string' && filePath.trim() ? filePath : undefined;
}

export const readFileTool: AgentTool = {
  name: 'read_file',
  description: '读取项目中的文件内容。修改任何文件前必须先读取该文件。',
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
    const denied = assertReadablePath(filePath);
    if (denied) return resultToString(denied);

    const content = fs.readFileSync(resolveProjectPath(filePath), 'utf-8');
    const maxLength = 9000;

    if (content.length > maxLength) {
      return `${content.slice(0, maxLength)}\n...（内容过长，已截断，共 ${content.length} 字符）`;
    }

    return content;
  },
};

export const writeFileTool: AgentTool = {
  name: 'write_file',
  description:
    '覆盖写入项目文件。只能修改 src/ 或 scripts/ 下的非 Agent 核心文件；修改前必须先 read_file。',
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
    const denied = assertWritablePath(filePath);
    if (denied) return resultToString(denied);

    if (process.env.AGENT_DRY_RUN === '1') {
      return resultToString({
        success: true,
        message: `dry-run：将写入 ${filePath}，实际未修改文件。`,
        stdout: `计划写入 ${content.length} 字符。`,
      });
    }

    const absolutePath = resolveProjectPath(filePath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, content, 'utf-8');

    const diff = runCommand('git', ['diff', '--', normalizeProjectPath(filePath)], {
      timeout: 10_000,
      maxOutput: 9000,
    });

    return resultToString({
      success: true,
      message: `已写入文件：${filePath}`,
      stdout: diff.stdout || '写入成功，但没有检测到 Git diff。',
    });
  },
};

export const runLintTool: AgentTool = {
  name: 'run_lint',
  description: '运行 ESLint 检查。可传 filePath 检查单个文件，不传则检查 src。',
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
    const filePath = getOptionalFilePath(args);
    const target = filePath || 'src';
    if (filePath) {
      const denied = assertReadablePath(filePath);
      if (denied) return resultToString(denied);
    }

    return resultToString(
      runCommand(pnpm, ['exec', 'eslint', target, '--ext', '.vue,.js,.ts'], {
        timeout: 60_000,
        maxOutput: 8000,
      })
    );
  },
};

export const fixLintTool: AgentTool = {
  name: 'fix_lint',
  description: '对指定文件运行 ESLint --fix。只能修复允许修改的文件。',
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
    const denied = assertWritablePath(filePath);
    if (denied) return resultToString(denied);

    if (process.env.AGENT_DRY_RUN === '1') {
      return resultToString({
        success: true,
        message: `dry-run：将对 ${filePath} 运行 ESLint --fix，实际未执行。`,
      });
    }

    const result = runCommand(pnpm, ['exec', 'eslint', filePath, '--fix'], {
      timeout: 60_000,
      maxOutput: 8000,
    });

    const diff = runCommand('git', ['diff', '--', normalizeProjectPath(filePath)], {
      timeout: 10_000,
      maxOutput: 8000,
    });

    return resultToString({
      success: result.success,
      message: result.success ? `已自动修复：${filePath}` : `自动修复后仍存在问题：${filePath}`,
      stdout: [result.stdout, diff.stdout ? `diff:\n${diff.stdout}` : '']
        .filter(Boolean)
        .join('\n'),
      stderr: result.stderr,
      exitCode: result.exitCode,
      truncated: result.truncated || diff.truncated,
    });
  },
};

export const runTestTool: AgentTool = {
  name: 'run_test',
  description: '运行 Vitest 单元测试。可传 filePath 运行相关测试，不传则运行全部测试。',
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
    const filePath = getOptionalFilePath(args);
    const commandArgs = filePath ? ['test', '--', filePath] : ['test'];

    return resultToString(
      runCommand(pnpm, commandArgs, {
        timeout: 120_000,
        maxOutput: 8000,
      })
    );
  },
};

export const runTypecheckTool: AgentTool = {
  name: 'run_typecheck',
  description: '运行 TypeScript 类型检查。修改 TS/Vue 文件后建议使用。',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
  execute: async () =>
    resultToString(
      runCommand(pnpm, ['type-check'], {
        timeout: 120_000,
        maxOutput: 6000,
      })
    ),
};

export const runFormatCheckTool: AgentTool = {
  name: 'run_format_check',
  description: '运行 Prettier 格式检查。',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
  execute: async () =>
    resultToString(
      runCommand(pnpm, ['format:check'], {
        timeout: 60_000,
        maxOutput: 6000,
      })
    ),
};

export const runBuildTool: AgentTool = {
  name: 'run_build',
  description: '运行生产构建，用于最终验证。',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
  execute: async () =>
    resultToString(
      runCommand(pnpm, ['build'], {
        timeout: 120_000,
        maxOutput: 9000,
      })
    ),
};

export const queryImpactTool: AgentTool = {
  name: 'query_impact',
  description: '根据 knowledge-graph.json 查询某个文件对应节点及上下游影响范围。',
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
    const filePath = normalizeProjectPath(args.filePath as string);
    const graphPath = path.resolve(PROJECT_ROOT, 'knowledge-graph.json');

    if (!fs.existsSync(graphPath)) {
      return resultToString({
        success: false,
        message: '知识图谱不存在，请先运行 pnpm graph。',
      });
    }

    const graph = JSON.parse(fs.readFileSync(graphPath, 'utf-8')) as KnowledgeGraph;
    const nodes = graph.nodes || [];
    const edges = graph.edges || [];
    const matchedNodes = nodes.filter((node) => normalizeProjectPath(node.filePath) === filePath);

    if (matchedNodes.length === 0) {
      return resultToString({
        success: true,
        message: `${filePath} 未在知识图谱中找到对应节点。`,
      });
    }

    const lines = matchedNodes.flatMap((node) => {
      const relatedEdges = edges.filter((edge) => edge.from === node.id || edge.to === node.id);
      if (relatedEdges.length === 0) {
        return [`${node.id} 没有记录到上下游关系。`];
      }

      return [
        `${node.id} (${node.type})`,
        ...relatedEdges.map((edge) =>
          edge.from === node.id
            ? `  - ${edge.type}: ${node.id} -> ${edge.to}`
            : `  - ${edge.type}: ${edge.from} -> ${node.id}`
        ),
      ];
    });

    return resultToString({
      success: true,
      message: `已查询 ${filePath} 的影响范围。`,
      stdout: lines.join('\n'),
    });
  },
};

export const gitDiffTool: AgentTool = {
  name: 'git_diff',
  description: '获取当前 Git 改动。只读工具。',
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
    const diffArgs = staged ? ['diff', '--cached'] : ['diff', 'HEAD'];

    return resultToString(
      runCommand('git', diffArgs, {
        timeout: 10_000,
        maxOutput: 12_000,
      })
    );
  },
};

export const allTools: AgentTool[] = [
  readFileTool,
  writeFileTool,
  runLintTool,
  fixLintTool,
  runTestTool,
  runTypecheckTool,
  runFormatCheckTool,
  runBuildTool,
  queryImpactTool,
  gitDiffTool,
];
