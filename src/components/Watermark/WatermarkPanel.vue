<script setup lang="ts">
import { ref, computed } from "vue";
import { useEditorStore } from "@/stores";
import type { WatermarkPosition } from "@/types";
import { getExifDisplayText, hasExifData, type ExifData } from "@/utils/exif";

const editorStore = useEditorStore();

const watermarkText = ref("© FrameSnap");
const watermarkPosition = ref<WatermarkPosition>("bottomRight");
const fontSize = ref(18);
const fontFamily = ref("Arial");
const textRotation = ref(0);
const textColor = ref("#000000");
const opacity = ref(80);

// Image watermark state
const watermarkImage = ref<string>("");
const watermarkSize = ref(80);

// EXIF data from store
const exifData = computed(() => editorStore.exifData);
const hasExif = computed(() => exifData.value ? hasExifData(exifData.value) : false);
const exifDisplayText = computed(() => exifData.value ? getExifDisplayText(exifData.value) : "");

const fontFamilies = [
  { label: "Arial", value: "Arial" },
  { label: "Times", value: "Times New Roman" },
  { label: "Courier", value: "Courier New" },
  { label: "Georgia", value: "Georgia" },
  { label: "Verdana", value: "Verdana" },
];

const positions: { label: string; value: WatermarkPosition }[] = [
  { label: "左上", value: "topLeft" },
  { label: "上中", value: "topCenter" },
  { label: "右上", value: "topRight" },
  { label: "左中", value: "middleLeft" },
  { label: "居中", value: "middleCenter" },
  { label: "右中", value: "middleRight" },
  { label: "左下", value: "bottomLeft" },
  { label: "下中", value: "bottomCenter" },
  { label: "右下", value: "bottomRight" },
];

function addTextWatermark() {
  if (!editorStore.image) return;
  editorStore.addTextWatermark(watermarkText.value, watermarkPosition.value, {
    fontSize: fontSize.value,
    fontFamily: fontFamily.value,
    color: textColor.value,
    opacity: opacity.value / 100,
    rotation: textRotation.value,
  });
}

function handleImageUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const result = e.target?.result as string;
    watermarkImage.value = result;
  };
  reader.readAsDataURL(file);
}

function addImageWatermark() {
  if (!editorStore.image || !watermarkImage.value) return;
  editorStore.addImageWatermark(watermarkImage.value, watermarkPosition.value, {
    width: watermarkSize.value,
    height: watermarkSize.value,
    opacity: opacity.value / 100,
  });
}

// Add EXIF watermark
function addExifWatermark() {
  if (!editorStore.image || !exifData.value) return;
  
  // Format EXIF data for display
  const parts: string[] = [];
  const exif = exifData.value;
  
  // Camera
  if (exif.model) parts.push(exif.model);
  else if (exif.make) parts.push(exif.make);
  
  // Exposure
  if (exif.exposureTime) parts.push(exif.exposureTime);
  if (exif.fNumber) parts.push(exif.fNumber);
  if (exif.iso) parts.push(`ISO ${exif.iso}`);
  
  // Lens
  if (exif.lensModel) parts.push(exif.lensModel);
  
  // Date
  if (exif.dateTimeOriginal) {
    const date = exif.dateTimeOriginal.split(" ")[0];
    parts.push(date);
  }
  
  // Location
  if (exif.gpsLatitude) {
    parts.push(exif.gpsLatitude);
    if (exif.gpsLongitude) parts.push(exif.gpsLongitude);
  }
  
  const exifText = parts.join(" | ");
  
  if (exifText) {
    editorStore.addTextWatermark(exifText, watermarkPosition.value, {
      fontSize: fontSize.value,
      fontFamily: fontFamily.value,
      color: textColor.value,
      opacity: opacity.value / 100,
      rotation: textRotation.value,
    });
  }
}

function deleteLayer(layerId: string) {
  editorStore.deleteLayer(layerId);
}

function toggleVisibility(layerId: string) {
  editorStore.toggleLayerVisibility(layerId);
}
</script>

<template>
  <div class="watermark-panel">
    <h3 class="panel-title">文字水印</h3>

    <div class="form-group">
      <label class="label">水印文字</label>
      <input
        v-model="watermarkText"
        type="text"
        class="input"
        placeholder="输入水印文字"
      />
    </div>

    <div class="form-group">
      <label class="label">位置</label>
      <div class="position-grid">
        <button
          v-for="pos in positions"
          :key="pos.value"
          :class="['position-btn', { active: watermarkPosition === pos.value }]"
          @click="watermarkPosition = pos.value"
        >
          {{ pos.label }}
        </button>
      </div>
    </div>

    <div class="form-group">
      <label class="label">字体</label>
      <select v-model="fontFamily" class="select">
        <option v-for="font in fontFamilies" :key="font.value" :value="font.value">
          {{ font.label }}
        </option>
      </select>
    </div>

    <div class="form-group">
      <label class="label">字体大小: {{ fontSize }}px</label>
      <input v-model="fontSize" type="range" min="12" max="72" class="slider" />
    </div>

    <div class="form-group">
      <label class="label">旋转: {{ textRotation }}°</label>
      <input v-model="textRotation" type="range" min="-180" max="180" class="slider" />
    </div>

    <div class="form-group">
      <label class="label">颜色</label>
      <input v-model="textColor" type="color" class="color-input" />
    </div>

    <div class="form-group">
      <label class="label">透明度: {{ opacity }}%</label>
      <input v-model="opacity" type="range" min="10" max="100" class="slider" />
    </div>

    <button
      class="add-button"
      :disabled="!editorStore.image"
      @click="addTextWatermark"
    >
      添加文字水印
    </button>

    <!-- EXIF Watermark Section -->
    <div class="divider"></div>
    <h3 class="panel-title">照片信息</h3>

    <div v-if="hasExif" class="exif-info">
      <p class="exif-label">检测到照片信息：</p>
      <p class="exif-text">{{ exifDisplayText }}</p>
      <div class="exif-detail" v-if="exifData">
        <span v-if="exifData.model">📷 {{ exifData.model }}</span>
        <span v-if="exifData.exposureTime">⏱ {{ exifData.exposureTime }}</span>
        <span v-if="exifData.fNumber">{{ exifData.fNumber }}</span>
        <span v-if="exifData.iso">ISO {{ exifData.iso }}</span>
        <span v-if="exifData.lensModel">🔍 {{ exifData.lensModel }}</span>
        <span v-if="exifData.dateTimeOriginal">📅 {{ exifData.dateTimeOriginal }}</span>
        <span v-if="exifData.gpsLatitude">📍 {{ exifData.gpsLatitude }}, {{ exifData.gpsLongitude }}</span>
      </div>
      <button 
        class="add-button exif-button" 
        :disabled="!editorStore.image"
        @click="addExifWatermark"
      >
        添加照片信息水印
      </button>
    </div>
    <div v-else class="exif-empty">
      <p>未检测到照片信息</p>
      <p class="exif-hint">仅支持 JPEG/TIFF 格式照片</p>
    </div>

    <!-- Image Watermark Section -->
    <div class="divider"></div>
    <h3 class="panel-title">图片水印</h3>

    <div class="form-group">
      <label class="label">上传水印图片</label>
      <label class="upload-btn">
        <input type="file" accept="image/*" @change="handleImageUpload" hidden />
        <span v-if="!watermarkImage">+ 选择图片</span>
        <img v-else :src="watermarkImage" alt="watermark" class="watermark-preview" />
      </label>
    </div>

    <div class="form-group">
      <label class="label">位置</label>
      <div class="position-grid">
        <button
          v-for="pos in positions"
          :key="pos.value"
          :class="['position-btn', { active: watermarkPosition === pos.value }]"
          @click="watermarkPosition = pos.value"
        >
          {{ pos.label }}
        </button>
      </div>
    </div>

    <div class="form-group">
      <label class="label">大小: {{ watermarkSize }}px</label>
      <input v-model="watermarkSize" type="range" min="20" max="200" class="slider" />
    </div>

    <div class="form-group">
      <label class="label">透明度: {{ opacity }}%</label>
      <input v-model="opacity" type="range" min="10" max="100" class="slider" />
    </div>

    <button
      class="add-button"
      :disabled="!editorStore.image || !watermarkImage"
      @click="addImageWatermark"
    >
      添加图片水印
    </button>

    <!-- Layer List -->
    <div v-if="editorStore.layers.length > 0" class="layer-section">
      <h4 class="layer-title">图层</h4>
      <div class="layer-list">
        <div
          v-for="layer in editorStore.layers"
          :key="layer.id"
          :class="[
            'layer-item',
            { active: layer.id === editorStore.activeLayerId },
          ]"
          @click="editorStore.setActiveLayer(layer.id)"
        >
          <button
            class="visibility-btn"
            @click.stop="toggleVisibility(layer.id)"
          >
            {{ layer.visible ? "👁" : "👁‍🗨" }}
          </button>
          <span class="layer-name">{{ layer.name }}</span>
          <button class="delete-btn" @click.stop="deleteLayer(layer.id)">
            ×
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.watermark-panel {
  padding: 20px;
}

.panel-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.label {
  display: block;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.input {
  width: 100%;
  padding: 10px 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
}

.input:focus {
  outline: none;
  border-color: var(--accent-color);
}

.select {
  width: 100%;
  padding: 10px 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
}

.select:focus {
  outline: none;
  border-color: var(--accent-color);
}

.position-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.position-btn {
  padding: 8px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
}

.position-btn:hover {
  border-color: var(--accent-color);
}

.position-btn.active {
  background: var(--accent-color);
  border-color: var(--accent-color);
  color: white;
}

.slider {
  width: 100%;
  accent-color: var(--accent-color);
}

.color-input {
  width: 100%;
  height: 40px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
}

.add-button {
  width: 100%;
  padding: 12px;
  background: var(--accent-color);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 20px;
}

.add-button:hover:not(:disabled) {
  opacity: 0.9;
}

.add-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.layer-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.layer-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.layer-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.layer-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.layer-item:hover {
  border-color: var(--accent-color);
}

.layer-item.active {
  border-color: var(--accent-color);
  background: rgba(255, 107, 53, 0.1);
}

.visibility-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  opacity: 0.7;
}

.visibility-btn:hover {
  opacity: 1;
}

.layer-name {
  flex: 1;
  font-size: 13px;
  color: var(--text-primary);
}

.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: var(--text-secondary);
  padding: 0 4px;
}

.delete-btn:hover {
  color: var(--error-color);
}

.divider {
  height: 1px;
  background: var(--border-color);
  margin: 24px 0;
}

.upload-btn {
  display: block;
  width: 100%;
  padding: 12px;
  background: var(--bg-primary);
  border: 1px dashed var(--border-color);
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 14px;
}

.upload-btn:hover {
  border-color: var(--accent-color);
}

.watermark-preview {
  width: 60px;
  height: 60px;
  object-fit: contain;
}

.exif-info {
  background: var(--bg-primary);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.exif-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.exif-text {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
  margin-bottom: 12px;
  word-break: break-all;
}

.exif-detail {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.exif-detail span {
  font-size: 11px;
  padding: 4px 8px;
  background: rgba(255, 107, 53, 0.1);
  border-radius: 4px;
  color: var(--accent-color);
}

.exif-button {
  margin-top: 0 !important;
}

.exif-empty {
  text-align: center;
  padding: 20px;
  color: var(--text-secondary);
}

.exif-empty p {
  margin: 0;
  font-size: 14px;
}

.exif-hint {
  font-size: 12px !important;
  opacity: 0.6;
  margin-top: 8px !important;
}
</style>
