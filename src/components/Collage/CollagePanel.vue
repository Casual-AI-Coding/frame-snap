<script setup lang="ts">
import { ref } from 'vue'
import { useEditorStore } from '@/stores'

const editorStore = useEditorStore()

const layout = ref<'grid' | '拼图' | '自由'>('grid')
const columns = ref(2)
const rows = ref(2)
const gap = ref(5)
const collageImages = ref<string[]>([])

const layouts = [
  { label: '网格', value: 'grid' },
  { label: '拼图', value: '拼图' },
  { label: '自由', value: '自由' },
]

function handleImageUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files) return

  Array.from(files).forEach((file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      collageImages.value.push(result)
    }
    reader.readAsDataURL(file)
  })
}

function addCollage() {
  if (collageImages.value.length === 0) {
    alert('请先上传图片')
    return
  }
  editorStore.addCollage({
    layout: layout.value,
    columns: columns.value,
    rows: rows.value,
    gap: gap.value,
    images: collageImages.value,
  })
}

function removeImage(index: number) {
  collageImages.value.splice(index, 1)
}
</script>

<template>
  <div class="collage-panel">
    <h3 class="panel-title">拼图</h3>

    <div class="form-group">
      <label class="label">布局</label>
      <div class="layout-options">
        <button
          v-for="l in layouts"
          :key="l.value"
          :class="['layout-btn', { active: layout === l.value }]"
          @click="layout = l.value as 'grid'"
        >
          {{ l.label }}
        </button>
      </div>
    </div>

    <template v-if="layout === 'grid'">
      <div class="form-group">
        <label class="label">列数: {{ columns }}</label>
        <input
          v-model="columns"
          type="range"
          min="1"
          max="4"
          class="slider"
        />
      </div>

      <div class="form-group">
        <label class="label">行数: {{ rows }}</label>
        <input
          v-model="rows"
          type="range"
          min="1"
          max="4"
          class="slider"
        />
      </div>

      <div class="form-group">
        <label class="label">间距: {{ gap }}px</label>
        <input
          v-model="gap"
          type="range"
          min="0"
          max="20"
          class="slider"
        />
      </div>
    </template>

    <div class="form-group">
      <label class="label">上传图片 ({{ collageImages.length }})</label>
      <label class="upload-btn">
        <input type="file" accept="image/*" multiple @change="handleImageUpload" hidden />
        <span>+ 添加图片</span>
      </label>
      <div v-if="collageImages.length > 0" class="image-list">
        <div v-for="(img, index) in collageImages" :key="index" class="image-item">
          <img :src="img" alt="" />
          <button class="remove-btn" @click="removeImage(index)">×</button>
        </div>
      </div>
    </div>

    <button
      class="add-button"
      @click="addCollage"
    >
      添加拼图
    </button>
  </div>
</template>

<style scoped>
.collage-panel {
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

.layout-options {
  display: flex;
  gap: 8px;
}

.layout-btn {
  flex: 1;
  padding: 10px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 13px;
}

.layout-btn:hover {
  border-color: var(--accent-color);
}

.layout-btn.active {
  background: var(--accent-color);
  border-color: var(--accent-color);
  color: white;
}

.slider {
  width: 100%;
  accent-color: var(--accent-color);
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

.add-button:hover {
  opacity: 0.9;
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

.image-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 12px;
}

.image-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
