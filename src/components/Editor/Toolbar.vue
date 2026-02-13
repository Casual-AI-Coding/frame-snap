<script setup lang="ts">
import { useEditorStore } from "@/stores";

const editorStore = useEditorStore();
</script>

<template>
  <div class="toolbar">
    <div class="toolbar-left">
      <button
        class="tool-btn"
        :disabled="!editorStore.canUndo"
        @click="editorStore.undo"
      >
        ↩
      </button>
      <button
        class="tool-btn"
        :disabled="!editorStore.canRedo"
        @click="editorStore.redo"
      >
        ↪
      </button>
    </div>
    <div class="toolbar-center">
      <span class="zoom-label">{{ Math.round(editorStore.zoom * 100) }}%</span>
      <input
        type="range"
        min="10"
        max="200"
        :value="editorStore.zoom * 100"
        @input="
          editorStore.setZoom(
            Number(($event.target as HTMLInputElement).value) / 100,
          )
        "
        class="zoom-slider"
      />
    </div>
    <div class="toolbar-right">
      <span class="canvas-size">
        {{ editorStore.canvasSize.width }} × {{ editorStore.canvasSize.height }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toolbar-left,
.toolbar-center,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tool-btn {
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  cursor: pointer;
  font-size: 16px;
}

.tool-btn:hover:not(:disabled) {
  border-color: var(--accent-color);
}

.tool-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.zoom-label {
  font-size: 12px;
  color: var(--text-secondary);
  min-width: 40px;
}

.zoom-slider {
  width: 120px;
  accent-color: var(--accent-color);
}

.canvas-size {
  font-size: 12px;
  color: var(--text-secondary);
}
</style>
