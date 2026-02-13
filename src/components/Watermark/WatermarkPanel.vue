<script setup lang="ts">
import { ref } from 'vue'
import { useEditorStore } from '@/stores'
import type { WatermarkPosition } from '@/types'

const editorStore = useEditorStore()

const watermarkText = ref('© FrameSnap')
const watermarkPosition = ref<WatermarkPosition>('bottomRight')
const fontSize = ref(18)
const textColor = ref('#ffffff')
const opacity = ref(80)

const positions: { label: string; value: WatermarkPosition }[] = [
  { label: '左上', value: 'topLeft' },
  { label: '上中', value: 'topCenter' },
  { label: '右上', value: 'topRight' },
  { label: '左中', value: 'middleLeft' },
  { label: '居中', value: 'middleCenter' },
  { label: '右中', value: 'middleRight' },
  { label: '左下', value: 'bottomLeft' },
  { label: '下中', value: 'bottomCenter' },
  { label: '右下', value: 'bottomRight' },
]

function addTextWatermark() {
  if (!editorStore.image) return
  editorStore.addTextWatermark(watermarkText.value, watermarkPosition.value, {
    fontSize: fontSize.value,
    color: textColor.value,
    opacity: opacity.value / 100,
  })
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
      <label class="label">字体大小: {{ fontSize }}px</label>
      <input
        v-model="fontSize"
        type="range"
        min="12"
        max="72"
        class="slider"
      />
    </div>

    <div class="form-group">
      <label class="label">颜色</label>
      <input v-model="textColor" type="color" class="color-input" />
    </div>

    <div class="form-group">
      <label class="label">透明度: {{ opacity }}%</label>
      <input
        v-model="opacity"
        type="range"
        min="10"
        max="100"
        class="slider"
      />
    </div>

    <button
      class="add-button"
      :disabled="!editorStore.image"
      @click="addTextWatermark"
    >
      添加水印
    </button>
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
</style>
