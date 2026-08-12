#!/usr/bin/env ts-node

// ============================================================
// 1. 引入依赖 + 类型定义
// ============================================================
import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';

/** 待生成文件结构类型 */
interface FileItem {
  path: string;
  content: string;
}

/** 生成配置项 */
interface GenerateOpts {
  force: boolean;
}

/** Inquirer 交互返回类型 */
interface PromptAnswers {
  name: string;
  confirm: boolean;
}

// ============================================================
// 2. 各类文件模板函数
// ============================================================
/** Vue页面模板 */
const viewTemplate = (capitalName: string): string => `
<template>
  <div class="${capitalName.toLowerCase()}">
    <h1>${capitalName} 页面</h1>
    <p>这是自动生成的 ${capitalName} 页面</p>
  </div>
</template>

<script setup lang="ts">
// ${capitalName} 页面的逻辑
console.log('${capitalName} 页面加载了');
</script>

<style scoped>
.${capitalName.toLowerCase()} {
  padding: 40px;
}
</style>
`;

/** API 请求模板 */
const apiTemplate = (capitalName: string): string => `
import request from '@/utils/request';

export interface I${capitalName}Params {
  // TODO: 定义接口参数
}

export interface I${capitalName}Response {
  // TODO: 定义接口返回数据
}

/**
 * 获取 ${capitalName} 数据
 */
export const get${capitalName}Data = (params?: I${capitalName}Params) => {
  return request.get<I${capitalName}Response>('/api/${capitalName.toLowerCase()}', { params });
};

/**
 * 更新 ${capitalName} 数据
 */
export const update${capitalName}Data = (data: I${capitalName}Params) => {
  return request.post('/api/${capitalName.toLowerCase()}/update', data);
};
`;

/** Pinia Store模板 */
const storeTemplate = (capitalName: string): string => `
import { defineStore } from 'pinia';
import { get${capitalName}Data, I${capitalName}Params, I${capitalName}Response } from '@/api/${capitalName.toLowerCase()}';

interface I${capitalName}State {
  data: I${capitalName}Response[];
  loading: boolean;
}

export const use${capitalName}Store = defineStore('${capitalName.toLowerCase()}', {
  state: (): I${capitalName}State => ({
    data: [],
    loading: false,
  }),

  actions: {
    async fetchData() {
      this.loading = true;
      try {
        // const res = await get${capitalName}Data();
        // this.data = res.data;
        console.log('获取 ${capitalName} 数据');
      } finally {
        this.loading = false;
      }
    },
  },
});
`;

// ============================================================
// 3. 组装所有待生成文件路径和内容
// ============================================================
function getFilesToGenerate(rawName: string): FileItem[] {
  const capitalName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const lowerName = rawName.toLowerCase();

  return [
    {
      path: `src/views/${lowerName}/index.vue`,
      content: viewTemplate(capitalName),
    },
    {
      path: `src/api/${lowerName}.ts`,
      content: apiTemplate(capitalName),
    },
    {
      path: `src/stores/modules/${lowerName}.ts`,
      content: storeTemplate(capitalName),
    },
  ];
}

// ============================================================
// 4. 文件写入核心逻辑
// ============================================================
function generateFiles(rawName: string, opts: GenerateOpts): boolean {
  const files = getFilesToGenerate(rawName);
  const { force } = opts;

  // 检测已存在文件
  const existFiles = files.filter((item) => fs.existsSync(item.path));
  if (existFiles.length > 0 && !force) {
    console.error('\n❌ 以下文件已存在（请使用 --force 强制覆盖）：');
    existFiles.forEach((item) => console.log(`   - ${item.path}`));
    return false;
  }

  // 循环创建目录+文件
  files.forEach(({ path: filePath, content }) => {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 创建目录: ${dir}`);
    }
    fs.writeFileSync(filePath, content.trim(), 'utf8');
    console.log(`✅ 生成文件: ${filePath}`);
  });

  return true;
}

// ============================================================
// 5. 交互式入口主函数
// ============================================================
async function main() {
  // 读取命令行参数
  const cliArgs = process.argv.slice(2);
  const force = cliArgs.includes('--force');

  // 交互式问答
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: '📝 请输入模块名称（如：user、product、order）：',
      validate: (input: string) => {
        const val = input.trim();
        if (!val) return '❌ 模块名称不能为空';
        if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(val)) {
          return '❌ 模块名称只能包含字母和数字，必须以字母开头';
        }
        return true;
      },
    },
    {
      type: 'confirm',
      name: 'confirm',
      message: (ans: Partial<PromptAnswers>) =>
        `即将生成 ${ans.name} 模块的 view + api + store，确认继续？`,
      default: true,
    },
  ]) as PromptAnswers;
 
  if (!answers.confirm) {
    console.log('👋 已取消生成');
    return;
  }

  const moduleName = answers.name.trim();
  const success = generateFiles(moduleName, { force });

  if (success) {
    const lower = moduleName.toLowerCase();
    console.log('\n🎉 模块生成完成！');
    console.log('📌 接下来请执行：');
    console.log(`   1. 在 router 中配置路由: /${lower}`);
    console.log(`   2. 在 api/${lower}.ts 中完善接口参数与返回类型`);
    console.log(`   3. 在 stores/modules/${lower}.ts 完善接口调用与业务`);
  }
}

// ============================================================
// 6. 捕获全局异常
// ============================================================
main().catch((err: Error) => {
  console.error('❌ 执行失败:', err.message);
  process.exit(1);
});