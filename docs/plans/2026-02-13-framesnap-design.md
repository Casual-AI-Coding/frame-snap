# 帧像 / FrameSnap - 产品设计文档

## 1. 项目概述

**项目名称**：帧像 / FrameSnap  
**项目类型**：纯前端 Web 应用（支持 PWA）  
**核心理念**：轻量、专业、优雅的照片水印与相框编辑工具  
**目标用户**：摄影师、社交媒体用户、电商经营者、需要批量加水印的用户

---

## 2. 功能规划

### 2.1 核心功能

| 功能 | 描述 | 优先级 |
|------|------|--------|
| 图片上传 | 支持拖拽/点击上传，支持 PNG/JPG/WEBP | P0 |
| 水印 | 文字水印、图片水印、位置/透明度/大小调整 | P0 |
| 相框 | 边框样式、背景模糊、滤镜效果 | P0 |
| 拼图 | 多图拼合、网格布局 | P1 |
| 模板市场 | 内置模板 + 自定义模板 + 导入/导出 | P1 |
| 导出 | PNG 高清导出、JPEG压缩导出 | P0 |

### 2.2 模板系统

- **内置模板**：预设 10+ 款水印/相框模板
- **自定义模板**：用户可保存自己的配置为模板
- **导入/导出**：通过 JSON 文件分享模板

---

## 3. 技术架构

### 3.1 技术栈

| 类别 | 技术选型 |
|------|----------|
| 框架 | Vue 3 + TypeScript |
| 构建工具 | Vite |
| 状态管理 | Pinia |
| Canvas 编辑 | Fabric.js |
| UI 组件 | Naive UI / 自定义 |
| 路由 | Vue Router |
| PWA | vite-plugin-pwa |
| 测试 | Vitest + Playwright |

### 3.2 目录结构

```
src/
├── assets/                 # 静态资源
│   ├── fonts/            # 字体文件
│   └── icons/            # 图标资源
├── components/            # Vue 组件
│   ├── common/           # 通用组件
│   │   ├── ColorPicker.vue
│   │   └── ImageUploader.vue
│   ├── Editor/           # 编辑器组件
│   │   ├── CanvasEditor.vue
│   │   ├── Toolbar.vue
│   │   └── LayerPanel.vue
│   ├── Watermark/        # 水印组件
│   │   ├── WatermarkPanel.vue
│   │   ├── TextWatermark.vue
│   │   └── ImageWatermark.vue
│   ├── Frame/            # 相框组件
│   │   ├── FramePanel.vue
│   │   ├── BorderFrame.vue
│   │   ├── BlurBackground.vue
│   │   └── FilterPanel.vue
│   ├── Template/         # 模板组件
│   │   ├── TemplateGallery.vue
│   │   ├── TemplateEditor.vue
│   │   └── ImportExport.vue
│   └── Collage/          # 拼图组件
│       ├── CollageLayout.vue
│       └── GridBuilder.vue
├── engines/              # 核心处理引擎
│   ├── watermark.ts      # 水印处理
│   ├── frame.ts          # 相框处理
│   ├── collage.ts        # 拼图处理
│   └── export.ts         # 导出服务
├── stores/               # Pinia 状态管理
│   ├── editor.ts         # 编辑器状态
│   ├── template.ts       # 模板管理
│   └── settings.ts       # 用户设置
├── types/                # TypeScript 类型定义
│   └── index.ts
├── utils/                # 工具函数
│   ├── fabric.ts         # Fabric.js 封装
│   └── image.ts          # 图片处理
├── App.vue
├── main.ts
└── router.ts
```

---

## 4. 数据设计

### 4.1 状态类型

```typescript
// 编辑器状态
interface EditorState {
  image: string | null;           // 当前图片 base64
  layers: Layer[];                // 图层列表
  activeLayerId: string | null;   // 当前选中图层
  zoom: number;                   // 画布缩放
  history: HistoryState[];         // 撤销/重做
  canvasSize: { width: number; height: number };
}

// 图层类型
interface Layer {
  id: string;
  type: 'image' | 'text' | 'frame' | 'collage';
  name: string;
  visible: boolean;
  lock: boolean;
  props: LayerProps;
}
```

### 4.2 模板结构

```typescript
interface Template {
  id: string;
  name: string;
  nameEn: string;
  category: 'watermark' | 'frame' | 'collage';
  thumbnail: string;
  config: TemplateConfig;
  createdAt: number;
  isBuiltIn: boolean;
}
```

---

## 5. UI/UX 设计

### 5.1 整体布局

```
┌─────────────────────────────────────────────────────────────┐
│  Header: Logo + 功能切换 (水印/相框/拼图/模板) + 导出按钮    │
├─────────────────────────────────────────────────────────────┤
│                    │                                        │
│   左侧面板         │         中央画布                        │
│   (功能配置)      │         (Fabric.js)                     │
│                    │                                        │
│   - 水印设置      │         图片预览 + 编辑区域             │
│   - 相框选择      │                                        │
│   - 拼图布局      │                                        │
│   - 模板库       │                                        │
│                    │                                        │
├────────────────────┼────────────────────────────────────────┤
│  底部工具栏: 缩放 | 撤销/重做 | 图层管理 | 画布尺寸           │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 配色方案

| 用途 | 颜色 | Hex |
|------|------|-----|
| 背景 | 深空灰 | #1c1c1e |
| 面板背景 | 炭灰 | #2d2d2d |
| 主文字 | 冷白 | #f5f5f7 |
| 次要文字 | 浅灰 | #8e8e93 |
| 强调色 | 亮橙 | #ff6b35 |
| 边框 | 深灰 | #3a3a3c |
| 成功 | 翠绿 | #30d158 |
| 错误 | 红色 | #ff453a |

### 5.3 Logo 设计

**方案：极简镜头框**

```
         ┌─────────┐
        ╱           ╲
       │    ◉      │     ◉ = 镜头光圈
       │   ╱ ╲    │
       │  ╱   ╲   │
       │ ╱     ╲  │
       │╱       ╲ │
       │         │
       │╲       ╱│
       │ ╲     ╱ │
        ╲ ╲   ╱ ╱
         ╲ ╲ ╱ ╱
          ╲ ╳ ╱
           ╲│╱
            │
         ───┴───
       帧像   FRAMESNAP
```

**色调**：深空灰 #1c1c1e + 冷白 #f5f5f7

---

## 6. 核心流程

### 6.1 用户操作流程

```
开始 → 上传图片 → 选择功能 → 配置 → 预览 → 导出
```

### 6.2 时序图：图片编辑

```
用户 → 组件 → Store → Fabric.js → Canvas渲染
```

### 6.3 时序图：导出

```
用户点击导出 → 遍历所有图层 → 渲染到Canvas → toDataURL → 触发下载
```

---

## 7. 错误处理

| 场景 | 处理方案 |
|------|----------|
| 图片格式不支持 | 提示支持的格式列表 |
| 文件太大 (>20MB) | 提示压缩或自动压缩 |
| Canvas渲染失败 | 捕获异常，显示友好提示 |
| 导出失败 | 保存当前状态，提供重试 |
| 内存不足 | 释放旧资源，提示用户 |

---

## 8. 发布计划

### 8.1 开发阶段

1. 项目初始化 (Vue 3 + Vite + TS)
2. 基础架构搭建 (目录、状态、路由)
3. Fabric.js Canvas 编辑器
4. 水印功能实现
5. 相框/滤镜功能
6. 拼图功能
7. 模板管理
8. PWA 配置

### 8.2 部署

- **平台**：GitHub Pages / Netlify / Vercel
- **域名**：framesnap.xxx (待定)
- **PWA**：可安装到桌面/手机

---

## 9. 版本规划

| 版本 | 功能 |
|------|------|
| v1.0 | 图片上传 + 水印 + 导出 |
| v1.1 | 相框 + 滤镜 |
| v1.2 | 拼图功能 |
| v1.3 | 模板市场 (导入/导出) |
| v2.0 | 正式发布 + PWA |

---

**文档创建日期**：2026-02-13  
**最后更新**：2026-02-13
