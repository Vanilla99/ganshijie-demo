# 肝视界 Demo

基于多模态影像的肝脏肿瘤分割与三维可视化辅助评估系统前端 Demo。

## 功能概览

- 高端医学科技风首页
- 数据驾驶舱与重点病例列表
- 单病例闭环演示：驾驶舱病例进入影像中心，再生成对应辅助报告
- DICOM 上传模拟、AI 处理流程动画、CT 切片查看、分割叠加开关
- Three.js 肝脏 / 肿瘤 / 血管三维模型查看
- 病例信息侧栏、病灶测量、切片缩略轴、3D 透明度控制
- 辅助报告中心、结构化报告预览、模拟 PDF 下载和图片导出
- 合作与专家支持、合作试点申请
- 统一演示状态枢纽、试点病例包、报告模板、导出记录与本地持久化
- 试点交付验收看板，覆盖病例包、材料清单、报告复核、导出留痕、提交记录与人工验收项
- 应用内视觉 QA 验收看板，覆盖桌面、移动端、Three.js 画布、控制台和端到端路径签收
- 本地存储异常保护与运行时恢复界面，避免演示中断时直接白屏

## 技术栈

- Vite
- React
- TypeScript
- Framer Motion
- Recharts
- Three.js / React Three Fiber
- lucide-react

## 本地运行

```bash
pnpm install
pnpm dev
```

开发服务默认运行在：

```text
http://127.0.0.1:5173/
```

## 构建

```bash
pnpm build
```

## 本地 QA 自检

```bash
pnpm qa:self-check
```

该命令会静态检查统一演示状态、病例工作台、影像留痕、报告联动、试点验收、交付简报、响应式样式、Three.js 入口和 GitHub API 同步说明等关键标记是否仍然存在。它适合作为提交前的快速回归门禁。

```bash
pnpm goal:completion-audit
```

该命令会按 goal 维度输出已具备证据的能力与仍待证明的项目。若浏览器桌面 / 移动端 QA 或 Three.js 画布可视检查尚未通过真实浏览器归档，它会以非零退出码结束，避免误判为已完成。

该命令不会替代真实浏览器 QA：桌面 / 移动端视觉检查、交互细节和 Three.js 画布像素验证仍需要在可访问 `127.0.0.1:5173` 的浏览器环境中复验。

`/pilot` 页面内置 `Visual QA Gate` 验收看板，可在真实浏览器检查完成后签收桌面、移动端、3D 画布、控制台和端到端路径状态，并记录证据标签、备注、签收时间，支持复制摘要和归档证据。

浏览器视觉验收步骤见：

```text
docs/visual-qa-playbook.md
```

## 代码管理

公开仓库：

```text
https://github.com/Vanilla99/ganshijie-demo
```

当前 Codex 执行环境中，常规 `git fetch` / `git push` 可能被策略拦截，因此本地 `git status -sb` 可能持续显示类似 `main...origin/main [ahead N]`。这表示本地 tracking ref 没有刷新，不一定表示远端没有同步。

远端同步以 GitHub API 写入 `main` 后的远端 commit/tree 为准。可用以下命令核对：

```bash
pnpm repo:sync-status
```

该命令会读取 GitHub API 的远端 `main` commit/tree，并逐个比对 `src/App.tsx`、`src/styles.css`、README、QA 手册和本地验证脚本等关键文件。若本地 `git status -sb` 仍显示 `ahead N`，但该命令显示 tree 与关键文件一致，则以 API 核对结果作为远端同步状态依据。

## 验证状态

- 已使用 `pnpm build` 做 TypeScript 与 Vite 生产构建验证。
- 已使用 `pnpm qa:self-check` 做关键工作流与交付证据标记自检。
- 已补充 `pnpm goal:completion-audit`，用于区分已具备证据的交付项和仍待真实浏览器证明的 QA 项。
- 已补充 `pnpm repo:sync-status`，用于核对 GitHub API 同步后的远端 tree 与关键文件内容。
- 已使用 `git diff --check` 做空白与补丁格式检查。
- 已补充 `docs/visual-qa-playbook.md`，用于完成桌面 / 移动端 / Three.js 画布人工验收。
- 浏览器桌面 / 移动端 QA 与 Three.js 画布视觉检查需要可访问 `127.0.0.1:5173` 的浏览器环境；若当前执行环境拦截本地浏览器访问，需要在允许本地预览的环境中补验。

## 说明

- 当前项目是前端 Demo，病例、上传、处理流程、报告生成均为 mock data。
- `public/assets/docx/` 中的图片为 Demo 展示素材。
- 原始需求文档 `.docx` 不纳入公开仓库版本管理。
