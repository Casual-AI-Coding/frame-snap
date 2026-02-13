<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useEditorStore } from '@/stores'
import { Canvas, Image, type FabricImage } from 'fabric'

const editorStore = useEditorStore()
const canvasEl = ref<HTMLCanvasElement | null>(null)
let fabricCanvas: Canvas | null = null

function initCanvas() {
  if (!canvasEl.value || fabricCanvas) return

  fabricCanvas = new Canvas(canvasEl.value, {
    width: editorStore.canvasSize.width,
    height: editorStore.canvasSize.height,
    backgroundColor: '#ffffff',
  })

  // Add image layer if exists
  if (editorStore.image) {
    Image.fromURL(editorStore.image).then((img: FabricImage) => {
      img.set({
        left: 0,
        top: 0,
        selectable: false,
      })
      fabricCanvas?.add(img)
      fabricCanvas?.renderAll()
    })
  }
}

onMounted(() => {
  initCanvas()
})
</script>

<template>
  <div class="canvas-editor">
    <canvas ref="canvasEl"></canvas>
    <div v-if="!editorStore.image" class="empty-state">
      <p>请先上传图片</p>
    </div>
  </div>
</template>

<style scoped>
.canvas-editor {
  position: relative;
  border: 1px solid var(--border-color);
  background: white;
}

.empty-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--text-secondary);
}
</style>
