<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useEditorStore } from "@/stores";
import type { TextLayerProps, FrameLayerProps, CollageLayerProps, ImageWatermarkLayerProps } from "@/types";

const editorStore = useEditorStore();

const activeLayer = computed(() => editorStore.activeLayer);

// Text watermark editing
const textContent = ref("");
const textFontSize = ref(24);
const textColor = ref("#000000");
const textOpacity = ref(80);

// Image watermark editing
const imageSize = ref(100);
const imageOpacity = ref(80);

// Frame editing
const borderWidth = ref(20);
const borderColor = ref("#000000");
const borderStyle = ref<"solid" | "dashed" | "dotted">("solid");
const filterType = ref<string>("grayscale");
const filterIntensity = ref(30);

// Collage editing
const collageColumns = ref(2);
const collageRows = ref(2);
const collageGap = ref(5);

// Sync values when active layer changes
watch(
  () => activeLayer.value,
  (layer) => {
    if (!layer) return;

    if (layer.type === "text") {
      const props = layer.props as TextLayerProps;
      textContent.value = props.text;
      textFontSize.value = props.fontSize;
      textColor.value = props.color;
      textOpacity.value = Math.round(props.opacity * 100);
    } else if (layer.type === "image-watermark") {
      const props = layer.props as ImageWatermarkLayerProps;
      imageSize.value = Math.max(props.width, props.height);
      imageOpacity.value = Math.round(props.opacity * 100);
    } else if (layer.type === "frame") {
      const props = layer.props as FrameLayerProps;
      borderWidth.value = props.borderWidth;
      borderColor.value = props.borderColor;
      borderStyle.value = props.borderStyle;
      filterType.value = props.filterType;
      filterIntensity.value = props.filterIntensity;
    } else if (layer.type === "collage") {
      const props = layer.props as CollageLayerProps;
      collageColumns.value = props.columns;
      collageRows.value = props.rows;
      collageGap.value = props.gap;
    }
  },
  { immediate: true },
);

// Update handlers
function updateTextLayer() {
  if (!activeLayer.value || activeLayer.value.type !== "text") return;
  editorStore.updateLayer(activeLayer.value.id, {
    text: textContent.value,
    fontSize: textFontSize.value,
    color: textColor.value,
    opacity: textOpacity.value / 100,
  });
}

function updateImageWatermark() {
  if (!activeLayer.value || activeLayer.value.type !== "image-watermark") return;
  editorStore.updateLayer(activeLayer.value.id, {
    width: imageSize.value,
    height: imageSize.value,
    opacity: imageOpacity.value / 100,
  });
}

function updateFrameLayer() {
  if (!activeLayer.value || activeLayer.value.type !== "frame") return;
  editorStore.updateLayer(activeLayer.value.id, {
    borderWidth: borderWidth.value,
    borderColor: borderColor.value,
    borderStyle: borderStyle.value,
    filterType: filterType.value as FrameLayerProps["filterType"],
    filterIntensity: filterIntensity.value,
  });
}

function updateCollageLayer() {
  if (!activeLayer.value || activeLayer.value.type !== "collage") return;
  editorStore.updateLayer(activeLayer.value.id, {
    columns: collageColumns.value,
    rows: collageRows.value,
    gap: collageGap.value,
  });
}
</script>

<template>
  <div v-if="activeLayer" class="layer-props">
    <h3 class="panel-title">
      编辑: {{ activeLayer.name }}
    </h3>

    <!-- Text Watermark Properties -->
    <template v-if="activeLayer.type === 'text'">
      <div class="form-group">
        <label class="label">文字内容</label>
        <input
          v-model="textContent"
          type="text"
          class="input"
          @change="updateTextLayer"
        />
      </div>

      <div class="form-group">
        <label class="label">字体大小: {{ textFontSize }}px</label>
        <input
          v-model="textFontSize"
          type="range"
          min="12"
          max="72"
          class="slider"
          @change="updateTextLayer"
        />
      </div>

      <div class="form-group">
        <label class="label">颜色</label>
        <input
          v-model="textColor"
          type="color"
          class="color-input"
          @change="updateTextLayer"
        />
      </div>

      <div class="form-group">
        <label class="label">透明度: {{ textOpacity }}%</label>
        <input
          v-model="textOpacity"
          type="range"
          min="10"
          max="100"
          class="slider"
          @change="updateTextLayer"
        />
      </div>
    </template>

    <!-- Image Watermark Properties -->
    <template v-else-if="activeLayer.type === 'image-watermark'">
      <div class="form-group">
        <label class="label">大小: {{ imageSize }}px</label>
        <input
          v-model="imageSize"
          type="range"
          min="20"
          max="200"
          class="slider"
          @change="updateImageWatermark"
        />
      </div>

      <div class="form-group">
        <label class="label">透明度: {{ imageOpacity }}%</label>
        <input
          v-model="imageOpacity"
          type="range"
          min="10"
          max="100"
          class="slider"
          @change="updateImageWatermark"
        />
      </div>
    </template>

    <!-- Frame Properties -->
    <template v-else-if="activeLayer.type === 'frame'">
      <div class="form-group">
        <label class="label">边框宽度: {{ borderWidth }}px</label>
        <input
          v-model="borderWidth"
          type="range"
          min="5"
          max="100"
          class="slider"
          @change="updateFrameLayer"
        />
      </div>

      <div class="form-group">
        <label class="label">边框颜色</label>
        <input
          v-model="borderColor"
          type="color"
          class="color-input"
          @change="updateFrameLayer"
        />
      </div>

      <div class="form-group">
        <label class="label">边框样式</label>
        <div class="style-options">
          <button
            :class="['style-btn', { active: borderStyle === 'solid' }]"
            @click="borderStyle = 'solid'; updateFrameLayer()"
          >
            实线
          </button>
          <button
            :class="['style-btn', { active: borderStyle === 'dashed' }]"
            @click="borderStyle = 'dashed'; updateFrameLayer()"
          >
            虚线
          </button>
          <button
            :class="['style-btn', { active: borderStyle === 'dotted' }]"
            @click="borderStyle = 'dotted'; updateFrameLayer()"
          >
            点线
          </button>
        </div>
      </div>

      <div class="form-group">
        <label class="label">滤镜强度: {{ filterIntensity }}%</label>
        <input
          v-model="filterIntensity"
          type="range"
          min="0"
          max="100"
          class="slider"
          @change="updateFrameLayer"
        />
      </div>
    </template>

    <!-- Collage Properties -->
    <template v-else-if="activeLayer.type === 'collage'">
      <div class="form-group">
        <label class="label">列数: {{ collageColumns }}</label>
        <input
          v-model="collageColumns"
          type="range"
          min="1"
          max="4"
          class="slider"
          @change="updateCollageLayer"
        />
      </div>

      <div class="form-group">
        <label class="label">行数: {{ collageRows }}</label>
        <input
          v-model="collageRows"
          type="range"
          min="1"
          max="4"
          class="slider"
          @change="updateCollageLayer"
        />
      </div>

      <div class="form-group">
        <label class="label">间距: {{ collageGap }}px</label>
        <input
          v-model="collageGap"
          type="range"
          min="0"
          max="20"
          class="slider"
          @change="updateCollageLayer"
        />
      </div>
    </template>

    <!-- Layer Actions -->
    <div class="layer-actions">
      <button
        class="action-btn"
        @click="editorStore.toggleLayerVisibility(activeLayer.id)"
      >
        {{ activeLayer.visible ? "隐藏" : "显示" }}
      </button>
      <button
        class="action-btn danger"
        @click="editorStore.deleteLayer(activeLayer.id)"
      >
        删除图层
      </button>
    </div>
  </div>
</template>

<style scoped>
.layer-props {
  padding: 20px;
  border-top: 1px solid var(--border-color);
}

.panel-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 14px;
}

.label {
  display: block;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.input {
  width: 100%;
  padding: 8px 10px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 13px;
}

.input:focus {
  outline: none;
  border-color: var(--accent-color);
}

.slider {
  width: 100%;
  accent-color: var(--accent-color);
}

.color-input {
  width: 100%;
  height: 36px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
}

.style-options {
  display: flex;
  gap: 6px;
}

.style-btn {
  flex: 1;
  padding: 8px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 12px;
}

.style-btn:hover {
  border-color: var(--accent-color);
}

.style-btn.active {
  background: var(--accent-color);
  border-color: var(--accent-color);
  color: white;
}

.layer-actions {
  display: flex;
  gap: 8px;
  margin-top: 20px;
}

.action-btn {
  flex: 1;
  padding: 10px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 12px;
}

.action-btn:hover {
  border-color: var(--accent-color);
  color: var(--text-primary);
}

.action-btn.danger:hover {
  border-color: var(--error-color);
  color: var(--error-color);
}
</style>
