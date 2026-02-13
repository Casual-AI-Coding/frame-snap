<script setup lang="ts">
import { ref } from 'vue'
import { useEditorStore } from '@/stores'

const editorStore = useEditorStore()

const frameType = ref<'border' | 'blur' | 'filter'>('border')
const borderWidth = ref(20)
const borderColor = ref('#ffffff')
const borderStyle = ref<'solid' | 'dashed' | 'dotted'>('solid')
const filterType = ref<'grayscale' | 'sepia' | 'blur' | 'brightness' | 'contrast'>('grayscale')
const filterIntensity = ref(30)

const borderStyles = [
  { label: '实线', value: 'solid' },
  { label: '虚线', value: 'dashed' },
  { label: '点线', value: 'dotted' },
]

const filterTypes = [
  { label: '灰度', value: 'grayscale' },
  { label: '复古', value: 'sepia' },
  { label: '模糊', value: 'blur' },
  { label: '亮度', value: 'brightness' },
  { label: '对比度', value: 'contrast' },
]

function addFrame() {
  if (!editorStore.image) return
  editorStore.addFrame({
    frameType: frameType.value,
    borderWidth: borderWidth.value,
    borderColor: borderColor.value,
    borderStyle: borderStyle.value,
    filterType: filterType.value,
    filterIntensity: filterIntensity.value,
  })
}
</script>

<template>
  <div class="frame-panel">
    <h3 class="panel-title">相框</h3>

    <div class="form-group">
      <label class="label">类型</label>
      <div class="type-tabs">
        <button
          :class="['type-tab', { active: frameType === 'border' }]"
          @click="frameType = 'border'"
        >
          边框
        </button>
        <button
          :class="['type-tab', { active: frameType === 'blur' }]"
          @click="frameType = 'blur'"
        >
          模糊
        </button>
        <button
          :class="['type-tab', { active: frameType === 'filter' }]"
          @click="frameType = 'filter'"
        >
          滤镜
        </button>
      </div>
    </div>

    <template v-if="frameType === 'border'">
      <div class="form-group">
        <label class="label">边框宽度: {{ borderWidth }}px</label>
        <input
          v-model="borderWidth"
          type="range"
          min="5"
          max="100"
          class="slider"
        />
      </div>

      <div class="form-group">
        <label class="label">边框颜色</label>
        <input v-model="borderColor" type="color" class="color-input" />
      </div>

      <div class="form-group">
        <label class="label">边框样式</label>
        <div class="style-options">
          <button
            v-for="style in borderStyles"
            :key="style.value"
            :class="['style-btn', { active: borderStyle === style.value }]"
            @click="borderStyle = style.value as 'solid'"
          >
            {{ style.label }}
          </button>
        </div>
      </div>
    </template>

    <template v-if="frameType === 'filter'">
      <div class="form-group">
        <label class="label">滤镜类型</label>
        <div class="filter-grid">
          <button
            v-for="filter in filterTypes"
            :key="filter.value"
            :class="['filter-btn', { active: filterType === filter.value }]"
            @click="filterType = filter.value as 'grayscale'"
          >
            {{ filter.label }}
          </button>
        </div>
      </div>

      <div class="form-group">
        <label class="label">强度: {{ filterIntensity }}%</label>
        <input
          v-model="filterIntensity"
          type="range"
          min="0"
          max="100"
          class="slider"
        />
      </div>
    </template>

    <button
      class="add-button"
      :disabled="!editorStore.image"
      @click="addFrame"
    >
      添加相框
    </button>
  </div>
</template>

<style scoped>
.frame-panel {
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

.type-tabs {
  display: flex;
  gap: 4px;
  background: var(--bg-primary);
  padding: 4px;
  border-radius: 8px;
}

.type-tab {
  flex: 1;
  padding: 8px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 13px;
}

.type-tab:hover {
  color: var(--text-primary);
}

.type-tab.active {
  background: var(--accent-color);
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

.style-options,
.filter-grid {
  display: flex;
  gap: 8px;
}

.style-btn,
.filter-btn {
  flex: 1;
  padding: 8px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 12px;
}

.style-btn:hover,
.filter-btn:hover {
  border-color: var(--accent-color);
}

.style-btn.active,
.filter-btn.active {
  background: var(--accent-color);
  border-color: var(--accent-color);
  color: white;
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
