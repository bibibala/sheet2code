# Sheet2Code

Excel 代码模板生成器

## 作用
- 有时前端需要制作非常复杂的表格，手写很费时并且如果对html的table不熟的话，合并单元格非常的头疼。
- 这个项目的目的，就是通过导入现有的 Excel 模板，一键生成可直接使用的 HTML 代码，大幅提升效率。

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
