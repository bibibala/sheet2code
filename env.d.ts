/// <reference types="vite/client" />

// 为 .vue 文件提供类型声明，避免 TS7016 报错
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
