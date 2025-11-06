# Sheet2Code

Excel 代码模板生成器

为不会做 Excel 的开发者服务，专注从 Excel（复杂表格）生成可直接复制使用的前端代码模板。你只需定义好模板，上传表格，即可获取 HTML/Vue 代码片段用于项目开发。

## 作用
- 面向复杂 Excel 布局，避免手写表格的繁琐与不稳定
- 通过模板驱动，快速获得稳定的前端表格代码
- 一键复制，直接粘贴到项目中使用

## 功能
- 上传 `.xlsx` 文件并选择工作表
- 预览表格数据
- 生成并复制单行 HTML 与可复用的 Vue SFC 示例

## 使用
- 安装依赖：
```sh
pnpm install
```
- 本地开发：
```sh
pnpm dev
```
- 构建生产包：
```sh
pnpm build
```

## 技术栈
- Vue 3 + Vite
- TypeScript
- Shiki 高亮
- XLSX 解析

## 许可证
本项目采用 MIT 许可证。
