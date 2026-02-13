# 图片加载问题修复总结

## 问题描述

用户反馈：上传图片到画布后，图片只显示在画布的左上角很小的区域，周围有大片空白。

## 症状分析

1. **首次上传图片** → 显示异常（图片很小，在左上角）
2. **返回后重新进入编辑** → 显示正常
3. **拖动缩放滑块** → 问题又出现

## 调试过程

### 第 1 轮：尝试缩放模式修改

**修改**：将缩放计算从 `Math.min`（fit 模式）改为 `Math.max`（cover 模式）

```typescript
// 修改前
const scale = Math.min(scaleX, scaleY, 1);

// 修改后  
const scale = Math.max(scaleX, scaleY);
```

**结果**：无效

### 第 2 轮：添加图片加载等待

**问题**：图片可能还没完全加载就去获取尺寸，导致获取到的是 0

**修改**：使用 `addEventListener` 等待图片 `load` 事件

```typescript
if (el.complete && el.naturalWidth > 0) {
  // 已加载，直接处理
  processImage(img, el, canvas, resolve, reject);
} else {
  // 等待加载
  el.addEventListener("load", function onLoad() { ... });
}
```

**结果**：无效

### 第 3 轮：画布自适应图片尺寸

**修改**：图片加载后将画布尺寸调整为图片的实际尺寸

```typescript
// 调整画布大小为图片尺寸
if (typeof canvas.setDimensions === "function") {
  canvas.setDimensions({ width: imgWidth, height: imgHeight });
} else {
  (canvas as any).width = imgWidth;
  (canvas as any).height = imgHeight;
}

// 图片 1:1 填充画布
img.scale(1);
```

**结果**：首次加载仍有问题，但重新进入编辑时正常

### 第 4 轮：修复缩放时序

**问题**：图片加载后，缩放值是基于原来的 800x600 计算的，没有更新

**修改**：
1. 图片加载完成后调用 `handleResize()` 重新计算缩放
2. 初始化时延迟调用 `handleResize()`

```typescript
async function loadBaseImage() {
  await addImageToCanvas(fabricCanvas, editorStore.image);
  // 图片加载后重新计算缩放
  handleResize();
}
```

**结果**：仍然无效

### 第 5 轮：移除重复的缩放处理（最终解决方案）

**根本原因**：代码中同时使用了两种缩放机制：

1. **CSS 缩放**：`transform: scale(zoom)` - 用于视觉缩放
2. **Canvas 内部缩放**：`fabricCanvas.setZoom(zoom)` - Fabric.js 内部缩放

这两个同时使用会相互冲突！

**修改**：移除 Canvas 的 `setZoom` 调用，只保留 CSS 缩放

```typescript
// 修改前
watch(() => editorStore.zoom, () => {
  if (fabricCanvas) {
    fabricCanvas.setZoom(editorStore.zoom);  // 冲突！
  }
});

// 修改后
watch(() => editorStore.zoom, () => {
  // 只通过 CSS transform 处理缩放，不再调用 setZoom
});
```

**结果**：✅ 成功！

## 最终解决方案

### 核心修改

1. **画布自适应**：图片加载后，画布尺寸自动调整为图片的实际尺寸
2. **CSS 缩放**：只使用 CSS `transform: scale()` 控制缩放，不使用 Fabric.js 的 `setZoom()`

### 修改的文件

- `src/utils/fabric.ts` - `addImageToCanvas` 和 `processImage` 函数
- `src/components/Editor/CanvasEditor.vue` - 移除重复的 zoom 监听器

## 经验教训

1. **不要重复实现同一功能**：当有 CSS 和 JS 两种方式做同一件事时，要确保只使用一种
2. **异步加载需要等待**：图片等资源的加载是异步的，必须等待完成后再进行尺寸计算
3. **时序问题**：初始化和更新的时序很重要，要在 DOM/数据准备好后再进行计算
4. **测试时清除缓存**：浏览器缓存会导致测试结果不准确，首次加载的问题容易被掩盖

## 相关代码

### fabric.ts - 图片加载核心逻辑

```typescript
function processImage(
  img: FabricImage,
  el: HTMLImageElement,
  canvas: Canvas,
  resolve: (value: FabricImage) => void,
  reject: (reason?: any) => void
) {
  const imgWidth = el.naturalWidth;
  const imgHeight = el.naturalHeight;

  if (imgWidth === 0 || imgHeight === 0) {
    reject(new Error("Image has no dimensions"));
    return;
  }

  // 调整画布为图片尺寸
  if (typeof canvas.setDimensions === "function") {
    canvas.setDimensions({ width: imgWidth, height: imgHeight });
  } else {
    (canvas as any).width = imgWidth;
    (canvas as any).height = imgHeight;
  }
  
  // 图片 1:1 填充
  img.set({
    width: imgWidth,
    height: imgHeight,
    scaleX: 1,
    scaleY: 1,
    left: 0,
    top: 0,
    originX: "left",
    originY: "top",
    selectable: false,
    evented: false,
  });

  canvas.add(img);
  canvas.renderAll();
  resolve(img);
}
```

### CanvasEditor.vue - 缩放控制

```typescript
// 使用 CSS transform 控制缩放，不使用 canvas.setZoom
const canvasStyle = computed(() => ({
  transform: `scale(${editorStore.zoom})`,
  transformOrigin: "center center",
}));
```

## 修复时间

2026-02-13

## 修复状态

✅ 已完成，所有测试通过
