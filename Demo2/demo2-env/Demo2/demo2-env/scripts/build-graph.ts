import { Project, SyntaxKind, Node } from 'ts-morph'
import { parse as parseVue } from '@vue/compiler-sfc'
import { globSync } from 'glob'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// 还原 __dirname、__filename
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ============ 类型定义 ============
interface GraphNode {
  id: string
  type: 'component' | 'page' | 'store' | 'composable' | 'api' | 'util' | 'directive' | 'global-component'
  name: string
  filePath: string
  props?: Record<string, any>
}

interface GraphEdge {
  from: string
  to: string
  type: 'renders' | 'calls' | 'subscribes' | 'navigates-to' | 'imports' | 'injects'
}

interface Graph {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

// ============ 1. 扫描所有 Vue 组件 ============
function scanVueComponents(projectRoot: string): GraphNode[] {
  const files = globSync('src/**/*.vue', { cwd: projectRoot, absolute: true })
  const nodes: GraphNode[] = []

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8')
    const { descriptor } = parseVue(content, { filename: file })
    
    const isPage = file.includes('/views/') || file.includes('/pages/') || file.includes('/page/')
    
    let name = path.basename(file, '.vue')
    if (descriptor.scriptSetup) {
      const scriptContent = descriptor.scriptSetup.content
      const match = scriptContent.match(/defineOptions\(\s*{\s*name:\s*['"](.+)['"]\s*}\s*\)/)
      if (match) name = match[1]
    }

    nodes.push({
      id: `component:${name}`,
      type: isPage ? 'page' : 'component',
      name,
      filePath: path.relative(projectRoot, file),
    })
  }

  return nodes
}

// ============ 2. 扫描 Pinia Store ============
function scanPiniaStores(projectRoot: string): GraphNode[] {
  const project = new Project({
    tsConfigFilePath: path.join(projectRoot, 'tsconfig.json'),
  })
  
  const storeFiles = globSync('src/**/*.store.ts', { cwd: projectRoot, absolute: true })
  const nodes: GraphNode[] = []

  for (const file of storeFiles) {
    const sourceFile = project.addSourceFileAtPath(file)
    
    const defineStoreCalls = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)
      .filter(call => call.getExpression().getText() === 'defineStore')
    
    for (const call of defineStoreCalls) {
      const args = call.getArguments()
      if (args.length === 0) continue
      
      let storeName = ''
      if (Node.isStringLiteral(args[0])) {
        storeName = args[0].getLiteralValue()
      } else {
        storeName = args[0].getText()
      }
      
      nodes.push({
        id: `store:${storeName}`,
        type: 'store',
        name: storeName,
        filePath: path.relative(projectRoot, file),
      })
    }
  }

  return nodes
}

// ============ 3. 扫描 Composable ============
function scanComposables(projectRoot: string): GraphNode[] {
  const project = new Project({
    tsConfigFilePath: path.join(projectRoot, 'tsconfig.json'),
  })
  
  const files = globSync('src/**/use*.ts', { cwd: projectRoot, absolute: true })
  const filteredFiles = files.filter(f => !f.includes('.store.'))
  const nodes: GraphNode[] = []

  for (const file of filteredFiles) {
    const sourceFile = project.addSourceFileAtPath(file)
    const functions = sourceFile.getFunctions()
    
    for (const func of functions) {
      const name = func.getName()
      if (name && name.startsWith('use') && name !== 'useStore' && !name.endsWith('Store')) {
        nodes.push({
          id: `composable:${name}`,
          type: 'composable',
          name,
          filePath: path.relative(projectRoot, file),
        })
      }
    }
  }

  return nodes
}

// ============ 4. 扫描 API 调用 ============
function scanAPICalls(projectRoot: string): GraphNode[] {
  const project = new Project({
    tsConfigFilePath: path.join(projectRoot, 'tsconfig.json'),
  })
  
  const files = globSync('src/**/*.{vue,ts,js}', { cwd: projectRoot, absolute: true })
  const apiSet = new Set<string>()
  const nodes: GraphNode[] = []

  for (const file of files) {
    if (file.includes('node_modules')) continue
    
    try {
      const sourceFile = project.addSourceFileAtPath(file)
      const calls = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)
      
      for (const call of calls) {
        const exprText = call.getExpression().getText()
        
        if (/request\.(get|post|put|delete|patch)/.test(exprText) || 
            /http\.(get|post|put|delete|patch)/.test(exprText) ||
            /api\.(get|post|put|delete|patch)/.test(exprText)) {
          const args = call.getArguments()
          if (args.length > 0 && Node.isStringLiteral(args[0])) {
            const url = args[0].getLiteralValue()
            const apiName = url.split('/').pop() || url
            const id = `api:${apiName}`
            
            if (!apiSet.has(id)) {
              apiSet.add(id)
              nodes.push({
                id,
                type: 'api',
                name: apiName,
                filePath: path.relative(projectRoot, file),
                props: { url },
              })
            }
          }
        }
      }
    } catch (e) {
      // 忽略解析错误的文件
    }
  }

  return nodes
}

// ============ 5. 建立关系 ============
function buildEdges(projectRoot: string, nodes: GraphNode[]): GraphEdge[] {
  const project = new Project({
    tsConfigFilePath: path.join(projectRoot, 'tsconfig.json'),
  })
  
  const edges: GraphEdge[] = []
  const vueFiles = globSync('src/**/*.vue', { cwd: projectRoot, absolute: true })

  for (const file of vueFiles) {
    const content = fs.readFileSync(file, 'utf-8')
    const { descriptor } = parseVue(content, { filename: file })
    
    if (!descriptor.scriptSetup) continue
    
    const tempFile = project.createSourceFile('temp.ts', descriptor.scriptSetup.content)
    const calls = tempFile.getDescendantsOfKind(SyntaxKind.CallExpression)
    const componentName = path.basename(file, '.vue')
    
    for (const call of calls) {
      const callText = call.getText()
      
      // 检测 Pinia Store
      const storeMatch = callText.match(/use(\w+)Store\(\)/)
      if (storeMatch) {
        const storeName = storeMatch[1]
        const targetNode = nodes.find(n => n.type === 'store' && n.name === storeName)
        if (targetNode) {
          edges.push({
            from: `component:${componentName}`,
            to: targetNode.id,
            type: 'subscribes',
          })
        }
        continue
      }
      
      // 检测 Composable
      const composableMatch = callText.match(/use([A-Z]\w*)\(/)
      if (composableMatch) {
        const composableName = `use${composableMatch[1]}`
        if (!composableName.endsWith('Store')) {
          const targetNode = nodes.find(n => n.type === 'composable' && n.name === composableName)
          if (targetNode) {
            edges.push({
              from: `component:${componentName}`,
              to: targetNode.id,
              type: 'calls',
            })
          }
        }
        continue
      }
      
      // 检测 API
      const apiMatch = callText.match(/request\.(get|post|put|delete)\(['"]([^'"]+)['"]/)
      if (apiMatch) {
        const url = apiMatch[2]
        const apiName = url.split('/').pop() || url
        const targetNode = nodes.find(n => n.type === 'api' && n.name === apiName)
        if (targetNode) {
          edges.push({
            from: `component:${componentName}`,
            to: targetNode.id,
            type: 'calls',
          })
        }
      }
    }
    
    project.removeSourceFile(tempFile)
  }

  return edges
}

// ============ 6. 建立路由关系 ============
function buildRouteEdges(projectRoot: string, nodes: GraphNode[]): GraphEdge[] {
  const edges: GraphEdge[] = []
  const routerFiles = globSync('src/**/router*.ts', { cwd: projectRoot, absolute: true })
  
  for (const file of routerFiles) {
    const content = fs.readFileSync(file, 'utf-8')
    const matches = content.matchAll(/path:\s*['"]([^'"]+)['"][\s\S]*?component:\s*\(\)\s*=>\s*import\(['"]([^'"]+)['"]\)/g)
    
    for (const match of matches) {
      const routePath = match[1]
      const importPath = match[2]
      const pageName = path.basename(importPath, '.vue')
      
      const pageNode = nodes.find(n => n.type === 'page' && n.name === pageName)
      if (pageNode) {
        edges.push({
          from: `route:${routePath}`,
          to: pageNode.id,
          type: 'navigates-to',
        })
      }
    }
  }
  
  return edges
}

// ============ 7. 生成完整图谱 ============
function buildFullGraph(projectRoot: string): Graph {
  console.log('🔍 开始扫描 Vue3 + Pinia 项目...')
  
  const nodes: GraphNode[] = [
    ...scanVueComponents(projectRoot),
    ...scanPiniaStores(projectRoot),
    ...scanComposables(projectRoot),
    ...scanAPICalls(projectRoot),
  ]
  
  console.log(`✅ 找到 ${nodes.length} 个节点`)
  
  const edges: GraphEdge[] = [
    ...buildEdges(projectRoot, nodes),
    ...buildRouteEdges(projectRoot, nodes),
  ]
  
  console.log(`✅ 找到 ${edges.length} 条关系`)
  
  return { nodes, edges }
}

// ============ 执行 ============
const projectRoot = path.resolve(__dirname, '..')
const graph = buildFullGraph(projectRoot)

const outputPath = path.join(projectRoot, 'knowledge-graph.json')
fs.writeFileSync(outputPath, JSON.stringify(graph, null, 2))
console.log(`📊 图谱已保存至: ${outputPath}`)

const stats = {
  components: graph.nodes.filter(n => n.type === 'component').length,
  pages: graph.nodes.filter(n => n.type === 'page').length,
  stores: graph.nodes.filter(n => n.type === 'store').length,
  composables: graph.nodes.filter(n => n.type === 'composable').length,
  apis: graph.nodes.filter(n => n.type === 'api').length,
}
console.table(stats)