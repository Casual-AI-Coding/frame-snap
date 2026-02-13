<script setup lang="ts">
import { ref } from "vue";
import CanvasEditor from "@/components/Editor/CanvasEditor.vue";
import Toolbar from "@/components/Editor/Toolbar.vue";
import WatermarkPanel from "@/components/Watermark/WatermarkPanel.vue";
import FramePanel from "@/components/Frame/FramePanel.vue";
import CollagePanel from "@/components/Collage/CollagePanel.vue";
import LayerPropertiesPanel from "@/components/Layer/LayerPropertiesPanel.vue";
import { useEditorStore, useSettingsStore } from "@/stores";

const editorStore = useEditorStore();
const settingsStore = useSettingsStore();

type Tab = "watermark" | "frame" | "collage";
const activeTab = ref<Tab>("watermark");
const canvasRef = ref<InstanceType<typeof CanvasEditor> | null>(null);
const exportFormat = ref<"png" | "jpeg">(settingsStore.settings.defaultExportFormat);

function handleExport() {
  if (!editorStore.image) {
    alert("请先上传图片");
    return;
  }
  canvasRef.value?.exportImage(exportFormat.value);
}
</script>

<template>
  <div class="editor">
    <header class="header">
      <div class="header-left">
        <button class="back-button" @click="$router.push('/')">←</button>
        <span class="title">编辑器</span>
      </div>
      <div class="header-center">
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
      </div>
      <div class="header-right">
        <select v-model="exportFormat" class="export-format">
          <option value="png">PNG</option>
          <option value="jpeg">JPEG</option>
        </select>
        <button class="export-button" @click="handleExport">导出</button>
      </div>
    </header>

    <main class="main">
      <aside class="sidebar">
        <WatermarkPanel v-if="activeTab === 'watermark'" />
        <FramePanel v-else-if="activeTab === 'frame'" />
        <CollagePanel v-else-if="activeTab === 'collage'" />
        <LayerPropertiesPanel v-if="editorStore.activeLayer" />
      </aside>

      <section class="canvas-container">
        <CanvasEditor ref="canvasRef" />
      </section>
    </main>

    <footer class="footer">
      <Toolbar />
    </footer>
  </div>
</template>

<style scoped>
.editor {
  display: flex;
  flex-direction: column;
  height: 100vh;
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

.back-button:hover {
  border-color: var(--accent-color);
}

.title {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
}

.tabs {
  display: flex;
  gap: 4px;
  background: var(--bg-primary);
  padding: 4px;
  border-radius: 8px;
}

.tab {
  padding: 8px 20px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.tab:hover {
  color: var(--text-primary);
}

.tab.active {
  background: var(--accent-color);
  color: white;
}

.header-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.export-format {
  padding: 8px 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  cursor: pointer;
  font-size: 14px;
}

.export-button {
  padding: 8px 24px;
  background: var(--accent-color);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.export-button:hover {
  opacity: 0.9;
}

.main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 320px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
}

.canvas-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  overflow: auto;
  padding: 20px;
}

.footer {
  padding: 12px 20px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
}
</style>
