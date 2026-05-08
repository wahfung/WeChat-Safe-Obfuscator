# 微信小程序安全盾 (WeChat Safe Obfuscator)

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![Next.js](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

这就一款基于浏览器的、**纯前端**微信小程序代码混淆工具。它旨在为开发者提供一种安全、高效且直观的方式来保护其小程序源代码，同时确保混淆后的代码 100% 符合微信小程序平台的安全规范（如 `eval` 禁用、WXS 兼容性等）。

> **核心承诺**：您的代码永远不会离开您的浏览器。所有处理均在本地内存中完成。

## ✨ 核心特性

- **🔒 纯前端隐私保护**：基于 Web Workers 架构，所有文件解析与混淆均在本地浏览器执行，零服务器上传，杜绝代码泄露风险。
- **⚡️ 高性能处理**：利用多线程并行处理技术，即使是大型小程序项目也能秒级完成混淆。
- **🛡 微信合规预设**：内置经过验证的“微信安全配置”，自动处理 `eval`、`new Function` 禁用及 `wxml` 数据绑定兼容性，确保过审。
- **👁 可视化差异对比**：集成 Monaco Editor（VS Code 内核），提供 Side-by-Side 的代码差异对比视图，混淆效果一目了然。
- **📦 智能资源处理**：自动识别 `js`、`wxs` 等脚本文件进行混淆，同时智能保留 `wxml`、`wxss` 及媒体资源结构。
- **🎨 专业级 UI**：采用 Deep Blue/Black 极客主题与 Glassmorphism 设计，提供沉浸式的开发体验。

## 🛠 技术栈

- **框架**: [Next.js](https://nextjs.org/) (App Router)
- **语言**: [TypeScript](https://www.typescriptlang.org/)
- **样式**: [Tailwind CSS](https://tailwindcss.com/) + Shadcn UI (Concepts) + Framer Motion
- **混淆引擎**: `javascript-obfuscator` (Web Worker 运行)
- **文件处理**: `jszip` (浏览器端流式处理)
- **编辑器**: `monaco-editor` / `@monaco-editor/react`

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 即可使用。

### 3. 生产构建与启动

```bash
npm run build
npm run start
```

生产服务默认监听 `3000` 端口，可通过 `PORT` 环境变量调整。

### 4. 测试数据

项目内置了一个演示用的测试包生成脚本：

```bash
node scripts/create-test-zip.js
```

运行后访问 `http://localhost:3000/demo.zip` 下载测试包。


## ⚙️ 混淆配置 (WeChat Safe Mode)

为了确保兼容微信小程序运行时，本项目采用了以下安全策略：

- **禁用 Eval/New Function**: 防止触发小程序 CSP 安全策略。
- **保留全局变量**: `App`, `Page`, `Component`, `wx` 等全局对象不被重命名。
- **禁用对象键混淆**: 防止 `wxml` 中的数据绑定 (`{{foo}}`) 失效。
- **字符串加密**: 采用 RC4 算法加密字符串常量。
- **控制流保护**: 适度开启控制流扁平化（需权衡包体积）。

## 📁 目录结构

```
repo/
├── src/
│   ├── app/                 # Next.js App Router 页面
│   ├── components/          # React UI 组件
│   │   ├── dashboard/       # 仪表盘特定组件 (UploadZone, StatsPanel)
│   │   └── ui/              # 通用基础组件
│   ├── hooks/               # 自定义 Hooks (use-obfuscator)
│   ├── lib/                 # 工具库 (zip-handler, zip-generator)
│   ├── types/               # TypeScript 类型定义
│   └── workers/             # Web Workers (混淆核心逻辑)
├── public/                  # 静态资源
├── scripts/                 # 辅助脚本
└── ...configs
```

## 📝 License

MIT
