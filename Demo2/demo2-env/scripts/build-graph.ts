import { Project, SyntaxKind, Node } from 'ts-morph';
import { parse as parseVue } from '@vue/compiler-sfc';
import { globSync } from 'glob';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// 还原 __dirname、__filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============ 类型定义 ============
interface GraphNode {
  id: string;
  type:
    | 'component'
    | 'page'
    | 'store'
    | 'composable'
    | 'api'
    | 'util'
    | 'directive'
    | 'global-component'
    | 'file'
    | 'entry'
    | 'html'
    | 'config'
    | 'script'
    | 'test'
    | 'style'
    | 'asset'
    | 'workflow';
  name: string;
  filePath: string;
  props?: Record<string, unknown>;
}

interface GraphEdge {
  from: string;
  to: string;
  type:
    | 'renders'
    | 'calls'
    | 'subscribes'
    | 'navigates-to'
    | 'imports'
    | 'injects'
    | 'tests'
    | 'configures'
    | 'runs'
    | 'references'
    | 'triggers'
    | 'declares';
}

interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// 只扫描会影响运行、构建、测试或部署的文件，避免把依赖和构建产物加入图谱。
const SCAN_TEMPLATE = {
  files: [
    'index.html',
    'package.json',
    'tsconfig*.json',
    'vite.config.*',
    'vitest.config.*',
    'playwright.config.*',
    '.env*',
    'src/**/*.{vue,ts,tsx,js,jsx,css,scss,less}',
    'router/**/*.{ts,js}',
    'scripts/**/*.{ts,js}',
    'e2e/**/*.{ts,js}',
    'tests/**/*.{ts,js}',
    'public/**/*',
    'src/assets/**/*',
    '../../.github/workflows/**/*.{yml,yaml}',
  ],
  ignored: [
    '**/node_modules/**',
    '**/dist/**',
    '**/deploy/**',
    '**/backups/**',
    '**/coverage/**',
    '**/test-results/**',
    '**/playwright-report/**',
    '**/*.map',
    '**/*.min.js',
    '**/*.lock',
  ],
};

const CODE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.vue']);
const IMPORT_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.vue', '.css', '.scss', '.less'];

// ============ 1. 扫描所有 Vue 组件 ============
function scanVueComponents(projectRoot: string): GraphNode[] {
  const files = globSync('src/**/*.vue', { cwd: projectRoot, absolute: true });
  const nodes: GraphNode[] = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const { descriptor } = parseVue(content, { filename: file });
    const normalizedFile = file.replace(/\\/g, '/');

    const isPage =
      normalizedFile.includes('/views/') ||
      normalizedFile.includes('/pages/') ||
      normalizedFile.includes('/page/');

    let name = path.basename(file, '.vue');
    if (descriptor.scriptSetup) {
      const scriptContent = descriptor.scriptSetup.content;
      const match = scriptContent.match(/defineOptions\(\s*{\s*name:\s*['"](.+)['"]\s*}\s*\)/);
      if (match) name = match[1];
    }

    nodes.push({
      id: `component:${name}`,
      type: isPage ? 'page' : 'component',
      name,
      filePath: path.relative(projectRoot, file),
    });
  }

  return nodes;
}

// ============ 2. 扫描主要项目文件 ============
function scanProjectFiles(projectRoot: string): GraphNode[] {
  const files = globSync(SCAN_TEMPLATE.files, {
    cwd: projectRoot,
    absolute: true,
    ignore: SCAN_TEMPLATE.ignored,
    dot: true,
  });

  return files.map((file) => {
    const relativePath = path.relative(projectRoot, file).replace(/\\/g, '/');
    const extension = path.extname(relativePath).toLowerCase();
    let type: GraphNode['type'] = 'file';

    if (relativePath === 'index.html') type = 'html';
    else if (relativePath === 'src/main.ts' || relativePath === 'src/main.js') type = 'entry';
    else if (relativePath.startsWith('src/') && ['.css', '.scss'].includes(extension))
      type = 'style';
    else if (
      relativePath.startsWith('e2e/') ||
      relativePath.includes('.test.') ||
      relativePath.includes('.spec.')
    ) {
      type = 'test';
    } else if (relativePath.startsWith('scripts/')) type = 'script';
    else if (relativePath.startsWith('public/') || relativePath.startsWith('src/assets/'))
      type = 'asset';
    else if (relativePath.startsWith('../') && relativePath.includes('/.github/workflows/'))
      type = 'workflow';
    else if (relativePath.startsWith('.env')) type = 'config';
    else if (
      ['package.json', 'tsconfig.json'].includes(relativePath) ||
      relativePath.startsWith('vite.config.') ||
      relativePath.startsWith('playwright.config.') ||
      relativePath.startsWith('vitest.config.')
    ) {
      type = 'config';
    }

    const name = path.basename(relativePath);
    return {
      id: `file:${relativePath}`,
      type,
      name,
      filePath: relativePath,
    };
  });
}

function resolveImportFile(
  projectRoot: string,
  importer: string,
  importPath: string
): string | undefined {
  const importBase = importPath.startsWith('@/')
    ? path.join(projectRoot, 'src', importPath.slice(2))
    : importPath.startsWith('.')
      ? path.resolve(path.dirname(importer), importPath)
      : undefined;
  if (!importBase) return undefined;

  const candidates = [
    importBase,
    ...IMPORT_EXTENSIONS.map((extension) => `${importBase}${extension}`),
    ...IMPORT_EXTENSIONS.map((extension) => path.join(importBase, `index${extension}`)),
  ];

  const resolved = candidates.find((candidate) => fs.existsSync(candidate));
  return resolved ? path.relative(projectRoot, resolved).replace(/\\/g, '/') : undefined;
}

// ============ 3. 建立文件级导入关系 ============
function buildFileImportEdges(projectRoot: string, fileNodes: GraphNode[]): GraphEdge[] {
  const filePaths = new Set(fileNodes.map((node) => node.filePath));
  const edges: GraphEdge[] = [];
  const sourceFiles = fileNodes.filter((node) =>
    ['.ts', '.tsx', '.js', '.jsx', '.vue'].includes(path.extname(node.filePath).toLowerCase())
  );

  for (const node of sourceFiles) {
    const absolutePath = path.join(projectRoot, node.filePath);
    let content = fs.readFileSync(absolutePath, 'utf-8');
    if (node.filePath.endsWith('.vue')) {
      const { descriptor } = parseVue(content, { filename: absolutePath });
      content = [descriptor.script, descriptor.scriptSetup]
        .filter(Boolean)
        .map((item) => item!.content)
        .join('\n');
    }

    const imports = content.matchAll(/(?:import(?:[\s\S]*?from\s*)?|import\s*\()(['"])([^'"]+)\1/g);
    for (const match of imports) {
      const targetPath = resolveImportFile(projectRoot, absolutePath, match[2]);
      if (!targetPath || !filePaths.has(targetPath)) continue;

      edges.push({
        from: node.id,
        to: `file:${targetPath}`,
        type: node.type === 'test' ? 'tests' : 'imports',
      });
    }
  }

  const htmlNode = fileNodes.find((node) => node.filePath === 'index.html');
  if (htmlNode) {
    const html = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf-8');
    const references = html.matchAll(/(?:src|href)=['"]([^'"]+)['"]/g);
    for (const match of references) {
      const reference = match[1].replace(/^\//, '');
      if (filePaths.has(reference)) {
        edges.push({ from: htmlNode.id, to: `file:${reference}`, type: 'imports' });
      }
    }
  }

  return edges;
}

function addEdge(edges: GraphEdge[], edge: GraphEdge): void {
  const exists = edges.some(
    (item) => item.from === edge.from && item.to === edge.to && item.type === edge.type
  );
  if (!exists) edges.push(edge);
}

function normalizeComponentName(name: string): string {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

// ============ 4. 建立 Vue 模板和文件声明关系 ============
function buildVueEdges(projectRoot: string, nodes: GraphNode[]): GraphEdge[] {
  const edges: GraphEdge[] = [];
  const vueFiles = globSync('src/**/*.vue', { cwd: projectRoot, absolute: true });

  for (const file of vueFiles) {
    const relativePath = path.relative(projectRoot, file).replace(/\\/g, '/');
    const fileNode = nodes.find((node) => node.id === `file:${relativePath}`);
    const componentName = path.basename(file, '.vue');
    const componentNode = nodes.find(
      (node) => node.id === `component:${componentName}` || node.filePath === relativePath
    );
    if (fileNode && componentNode && componentNode.id !== fileNode.id) {
      addEdge(edges, { from: fileNode.id, to: componentNode.id, type: 'declares' });
    }

    const content = fs.readFileSync(file, 'utf-8');
    const { descriptor } = parseVue(content, { filename: file });
    const template = descriptor.template?.content || '';
    const tags = template.matchAll(/<([A-Z][\w-]*|[a-z][\w-]*-[\w-]+)(?:\s|\/?>)/g);

    for (const match of tags) {
      const targetName = normalizeComponentName(match[1]);
      const targetNode = nodes.find((node) => node.id === `component:${targetName}`);
      if (componentNode && targetNode && targetNode.id !== componentNode.id) {
        addEdge(edges, { from: componentNode.id, to: targetNode.id, type: 'renders' });
      }
    }
  }

  return edges;
}

// ============ 5. 建立 package.json、配置和 CI/CD 关系 ============
function buildProjectConfigurationEdges(projectRoot: string, nodes: GraphNode[]): GraphEdge[] {
  const edges: GraphEdge[] = [];
  const nodeByPath = new Map(nodes.map((node) => [node.filePath, node]));
  const packageNode = nodeByPath.get('package.json');

  if (packageNode) {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8')
    ) as {
      scripts?: Record<string, string>;
    };
    for (const command of Object.values(packageJson.scripts || {})) {
      for (const match of command.matchAll(/(?:^|\s)([^\s;&|]+\.(?:ts|js))(?:\s|$)/g)) {
        const scriptPath = match[1].replace(/\\/g, '/');
        const scriptNode = nodeByPath.get(scriptPath);
        if (scriptNode) {
          addEdge(edges, { from: packageNode.id, to: scriptNode.id, type: 'runs' });
        }
      }
    }
  }

  for (const node of nodes.filter((item) => item.type === 'workflow')) {
    const workflow = fs.readFileSync(path.join(projectRoot, node.filePath), 'utf-8');
    if (packageNode && /pnpm\s+(?:install|run|exec|[a-z][\w:-]*)/.test(workflow)) {
      addEdge(edges, { from: node.id, to: packageNode.id, type: 'triggers' });
    }
    for (const scriptNode of nodes.filter((item) => item.type === 'script')) {
      if (workflow.includes(scriptNode.filePath)) {
        addEdge(edges, { from: node.id, to: scriptNode.id, type: 'runs' });
      }
    }
  }

  for (const node of nodes.filter((item) => item.type === 'config')) {
    const configContent = fs.readFileSync(path.join(projectRoot, node.filePath), 'utf-8');
    for (const target of nodes.filter((item) => item.id.startsWith('file:src/'))) {
      const targetName = path.basename(target.filePath);
      if (configContent.includes(targetName)) {
        addEdge(edges, { from: node.id, to: target.id, type: 'configures' });
      }
    }
  }

  const envNodes = nodes.filter(
    (item) => item.type === 'config' && item.filePath.startsWith('.env')
  );
  for (const envNode of envNodes) {
    const envContent = fs.readFileSync(path.join(projectRoot, envNode.filePath), 'utf-8');
    for (const target of nodes.filter((item) => CODE_EXTENSIONS.has(path.extname(item.filePath)))) {
      const targetContent = fs.readFileSync(path.join(projectRoot, target.filePath), 'utf-8');
      const variables = envContent.matchAll(/^([A-Z][A-Z0-9_]*)=/gm);
      for (const variable of variables) {
        if (targetContent.includes(variable[1])) {
          addEdge(edges, { from: envNode.id, to: target.id, type: 'configures' });
        }
      }
    }
  }

  return edges;
}

// ============ 4. 扫描 Pinia Store ============
function scanPiniaStores(projectRoot: string): GraphNode[] {
  const project = new Project({
    tsConfigFilePath: path.join(projectRoot, 'tsconfig.json'),
  });

  const storeFiles = globSync('src/**/*.ts', { cwd: projectRoot, absolute: true });
  const nodes: GraphNode[] = [];

  for (const file of storeFiles) {
    const sourceFile = project.addSourceFileAtPath(file);

    const defineStoreCalls = sourceFile
      .getDescendantsOfKind(SyntaxKind.CallExpression)
      .filter((call) => call.getExpression().getText() === 'defineStore');

    for (const call of defineStoreCalls) {
      const args = call.getArguments();
      if (args.length === 0) continue;

      let storeName = '';
      if (Node.isStringLiteral(args[0])) {
        storeName = args[0].getLiteralValue();
      } else {
        storeName = args[0].getText();
      }

      nodes.push({
        id: `store:${storeName}`,
        type: 'store',
        name: storeName,
        filePath: path.relative(projectRoot, file),
      });
    }
  }

  return nodes;
}

// ============ 5. 扫描 Composable ============
function scanComposables(projectRoot: string): GraphNode[] {
  const project = new Project({
    tsConfigFilePath: path.join(projectRoot, 'tsconfig.json'),
  });

  const files = globSync('src/**/use*.ts', { cwd: projectRoot, absolute: true });
  const filteredFiles = files.filter((f) => !f.includes('.store.'));
  const nodes: GraphNode[] = [];

  for (const file of filteredFiles) {
    const sourceFile = project.addSourceFileAtPath(file);
    const functions = sourceFile.getFunctions();

    for (const func of functions) {
      const name = func.getName();
      if (name && name.startsWith('use') && name !== 'useStore' && !name.endsWith('Store')) {
        nodes.push({
          id: `composable:${name}`,
          type: 'composable',
          name,
          filePath: path.relative(projectRoot, file),
        });
      }
    }
  }

  return nodes;
}

// ============ 6. 扫描 API 调用 ============
function scanAPICalls(projectRoot: string): GraphNode[] {
  const project = new Project({
    tsConfigFilePath: path.join(projectRoot, 'tsconfig.json'),
  });

  const files = globSync('src/**/*.{vue,ts,js}', { cwd: projectRoot, absolute: true });
  const apiSet = new Set<string>();
  const nodes: GraphNode[] = [];

  for (const file of files) {
    if (file.includes('node_modules')) continue;

    try {
      const sourceFile = project.addSourceFileAtPath(file);
      const calls = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);

      for (const call of calls) {
        const exprText = call.getExpression().getText();

        if (
          /request\.(get|post|put|delete|patch)/.test(exprText) ||
          /http\.(get|post|put|delete|patch)/.test(exprText) ||
          /api\.(get|post|put|delete|patch)/.test(exprText)
        ) {
          const args = call.getArguments();
          if (args.length > 0 && Node.isStringLiteral(args[0])) {
            const url = args[0].getLiteralValue();
            const apiName = url.split('/').pop() || url;
            const id = `api:${apiName}`;

            if (!apiSet.has(id)) {
              apiSet.add(id);
              nodes.push({
                id,
                type: 'api',
                name: apiName,
                filePath: path.relative(projectRoot, file),
                props: { url },
              });
            }
          }
        }
      }
    } catch {
      // 忽略解析错误的文件
    }
  }

  return nodes;
}

// ============ 7. 建立关系 ============
function buildEdges(projectRoot: string, nodes: GraphNode[]): GraphEdge[] {
  const project = new Project({
    tsConfigFilePath: path.join(projectRoot, 'tsconfig.json'),
  });

  const edges: GraphEdge[] = [];
  const vueFiles = globSync('src/**/*.vue', { cwd: projectRoot, absolute: true });

  for (const file of vueFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const { descriptor } = parseVue(content, { filename: file });

    if (!descriptor.scriptSetup) continue;

    const tempFile = project.createSourceFile('temp.ts', descriptor.scriptSetup.content);
    const calls = tempFile.getDescendantsOfKind(SyntaxKind.CallExpression);
    const componentName = path.basename(file, '.vue');

    for (const call of calls) {
      const callText = call.getText();

      // 检测 Pinia Store
      const storeMatch = callText.match(/use(\w+)Store\(\)/);
      if (storeMatch) {
        const storeName = storeMatch[1];
        const targetNode = nodes.find((n) => n.type === 'store' && n.name === storeName);
        if (targetNode) {
          edges.push({
            from: `component:${componentName}`,
            to: targetNode.id,
            type: 'subscribes',
          });
        }
        continue;
      }

      // 检测 Composable
      const composableMatch = callText.match(/use([A-Z]\w*)\(/);
      if (composableMatch) {
        const composableName = `use${composableMatch[1]}`;
        if (!composableName.endsWith('Store')) {
          const targetNode = nodes.find(
            (n) => n.type === 'composable' && n.name === composableName
          );
          if (targetNode) {
            edges.push({
              from: `component:${componentName}`,
              to: targetNode.id,
              type: 'calls',
            });
          }
        }
        continue;
      }

      // 检测 API
      const apiMatch = callText.match(/request\.(get|post|put|delete)\(['"]([^'"]+)['"]/);
      if (apiMatch) {
        const url = apiMatch[2];
        const apiName = url.split('/').pop() || url;
        const targetNode = nodes.find((n) => n.type === 'api' && n.name === apiName);
        if (targetNode) {
          edges.push({
            from: `component:${componentName}`,
            to: targetNode.id,
            type: 'calls',
          });
        }
      }
    }

    project.removeSourceFile(tempFile);
  }

  return edges;
}

// ============ 8. 建立路由关系 ============
function buildRouteEdges(projectRoot: string, nodes: GraphNode[]): GraphEdge[] {
  const edges: GraphEdge[] = [];
  const routerFiles = globSync(['src/**/router*.ts', 'router/**/*.ts'], {
    cwd: projectRoot,
    absolute: true,
  });

  for (const file of routerFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const matches = content.matchAll(
      /path:\s*['"]([^'"]+)['"][\s\S]*?component:\s*\(\)\s*=>\s*import\(['"]([^'"]+)['"]\)/g
    );

    for (const match of matches) {
      const routePath = match[1];
      const importPath = match[2];
      const pageName = path.basename(importPath, '.vue');

      const pageNode = nodes.find((n) => n.type === 'page' && n.name === pageName);
      if (pageNode) {
        edges.push({
          from: `route:${routePath}`,
          to: pageNode.id,
          type: 'navigates-to',
        });
      }
    }
  }

  return edges;
}

// ============ 9. 生成完整图谱 ============
function buildFullGraph(projectRoot: string): Graph {
  console.log('🔍 开始扫描 Vue3 + Pinia 项目...');

  const nodes: GraphNode[] = [
    ...scanProjectFiles(projectRoot),
    ...scanVueComponents(projectRoot),
    ...scanPiniaStores(projectRoot),
    ...scanComposables(projectRoot),
    ...scanAPICalls(projectRoot),
  ];

  console.log(`✅ 找到 ${nodes.length} 个节点`);

  const edges: GraphEdge[] = [
    ...buildFileImportEdges(
      projectRoot,
      nodes.filter((node) => node.id.startsWith('file:'))
    ),
    ...buildVueEdges(projectRoot, nodes),
    ...buildProjectConfigurationEdges(projectRoot, nodes),
    ...buildEdges(projectRoot, nodes),
    ...buildRouteEdges(projectRoot, nodes),
  ];

  console.log(`✅ 找到 ${edges.length} 条关系`);

  return { nodes, edges };
}

function updateVisualization(projectRoot: string, graph: Graph): void {
  const visualizationPath = path.join(projectRoot, 'visualize.html');
  if (!fs.existsSync(visualizationPath)) return;

  const content = fs.readFileSync(visualizationPath, 'utf-8');
  const rawMarker = 'const raw =';
  const colorMapMarker = 'const colorMap =';
  const rawStart = content.indexOf(rawMarker);
  const colorMapStart = content.indexOf(colorMapMarker, rawStart);
  if (rawStart === -1 || colorMapStart === -1) return;

  const graphData = JSON.stringify(graph);
  const updatedContent =
    content.slice(0, rawStart) +
    `const raw = ${graphData};\n\n      ` +
    content.slice(colorMapStart);

  if (updatedContent !== content) {
    fs.writeFileSync(visualizationPath, updatedContent);
    console.log(`🖥️ 可视化页面已同步: ${visualizationPath}`);
  }
}

// ============ 执行 ============
const projectRoot = path.resolve(__dirname, '..');
const graph = buildFullGraph(projectRoot);

const outputPath = path.join(projectRoot, 'knowledge-graph.json');
fs.writeFileSync(outputPath, JSON.stringify(graph, null, 2));
console.log(`📊 图谱已保存至: ${outputPath}`);
updateVisualization(projectRoot, graph);

const stats = {
  components: graph.nodes.filter((n) => n.type === 'component').length,
  pages: graph.nodes.filter((n) => n.type === 'page').length,
  stores: graph.nodes.filter((n) => n.type === 'store').length,
  composables: graph.nodes.filter((n) => n.type === 'composable').length,
  apis: graph.nodes.filter((n) => n.type === 'api').length,
};
console.table(stats);
