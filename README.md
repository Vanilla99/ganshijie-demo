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

## 说明

- 当前项目是前端 Demo，病例、上传、处理流程、报告生成均为 mock data。
- `public/assets/docx/` 中的图片为 Demo 展示素材。
- 原始需求文档 `.docx` 不纳入公开仓库版本管理。
