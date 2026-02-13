<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTemplateStore, useEditorStore } from '@/stores'
import type { Template } from '@/types'

const router = useRouter()
const templateStore = useTemplateStore()
const editorStore = useEditorStore()

type Tab = 'watermark' | 'frame' | 'collage'
const activeTab = ref<Tab>('watermark')
const fileInput = ref<HTMLInputElement | null>(null)

const filteredTemplates = computed(() => {
  return templateStore.templatesByCategory(activeTab.value)
})

function useTemplate(template: Template) {
  editorStore.loadFromTemplate(template.config.layers)
  editorStore.canvasSize = template.config.canvas
  router.push('/editor')
}

function exportTemplate(template: Template) {
  const json = templateStore.exportTemplate(template.id)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${template.nameEn || template.name}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function deleteTemplate(id: string) {
  templateStore.deleteTemplate(id)
}

function triggerImport() {
  fileInput.value?.click()
}

function handleImport(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const json = e.target?.result as string
    const template = templateStore.importTemplate(json)
    if (template) {
      alert('模板导入成功！')
    } else {
      alert('模板格式无效')
    }
  }
  reader.readAsText(file)
  target.value = ''
}
</script>

<template>
  <div class="templates">
    <header class="header">
      <div class="header-left">
        <button class="back-button" @click="$router.push('/')">←</button>
        <span class="title">模板库</span>
      </div>
      <div class="header-right">
        <button class="import-button" @click="triggerImport">
          导入模板
        </button>
        <input
          ref="fileInput"
          type="file"
          accept=".json"
          @change="handleImport"
          hidden
        />
      </div>
    </header>

    <main class="main">
      <div class="tabs">
        <button
          :class="['tab', { active: activeTab === 'watermark' }]"
          @click="activeTab = 'watermark'"
        >
          水印
        </button>
        <button
          :class="['tab', { active: activeTab === 'frame' }]"
          @click="activeTab = 'frame'"
        >
          相框
        </button>
        <button
          :class="['tab', { active: activeTab === 'collage' }]"
          @click="activeTab = 'collage'"
        >
          拼图
        </button>
      </div>

      <div class="template-grid">
        <div
          v-for="template in filteredTemplates"
          :key="template.id"
          class="template-card"
        >
          <div class="template-preview">
            <span v-if="!template.thumbnail" class="preview-placeholder">◉</span>
            <img v-else :src="template.thumbnail" :alt="template.name" />
          </div>
          <div class="template-info">
            <h3 class="template-name">{{ template.name }}</h3>
            <p class="template-name-en">{{ template.nameEn }}</p>
          </div>
          <div class="template-actions">
            <button class="action-btn primary" @click="useTemplate(template)">
              使用
            </button>
            <button class="action-btn" @click="exportTemplate(template)">
              导出
            </button>
            <button
              v-if="!template.isBuiltIn"
              class="action-btn danger"
              @click="deleteTemplate(template.id)"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.templates {
  min-height: 100vh;
  background: var(--bg-primary);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-button {
  width: 36px;
  height: 36px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  cursor: pointer;
  font-size: 18px;
}

.title {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
}

.import-button {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  cursor: pointer;
  font-size: 14px;
}

.import-button:hover {
  border-color: var(--accent-color);
}

.main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
}

.tab {
  padding: 8px 24px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 14px;
}

.tab:hover {
  color: var(--text-primary);
}

.tab.active {
  background: var(--accent-color);
  color: white;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.template-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s ease;
}

.template-card:hover {
  transform: translateY(-4px);
}

.template-preview {
  height: 160px;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-placeholder {
  font-size: 48px;
  color: var(--border-color);
}

.template-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.template-info {
  padding: 16px;
}

.template-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.template-name-en {
  font-size: 12px;
  color: var(--text-secondary);
}

.template-actions {
  display: flex;
  gap: 8px;
  padding: 0 16px 16px;
}

.action-btn {
  flex: 1;
  padding: 8px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  border-color: var(--accent-color);
  color: var(--text-primary);
}

.action-btn.primary {
  background: var(--accent-color);
  border-color: var(--accent-color);
  color: white;
}

.action-btn.danger:hover {
  border-color: var(--error-color);
  color: var(--error-color);
}
</style>
