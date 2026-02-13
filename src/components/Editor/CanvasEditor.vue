<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useEditorStore, useSettingsStore } from '@/stores'
import { Canvas, type FabricObject } from 'fabric'
import { addImageToCanvas, addTextToCanvas, addFrameToCanvas, exportCanvas, downloadImage, fitCanvasToContainer } from '@/utils/fabric'
import type { TextLayerProps, FrameLayerProps } from '@/types'

const editorStore = useEditorStore()
const settingsStore = useSettingsStore()

const containerRef = ref<HTMLDivElement | null>(null)
const canvasEl = ref<HTMLCanvasElement | null>(null)
let fabricCanvas: Canvas | null = null
const fabricObjects = new Map<string, FabricObject>()

const canvasStyle = computed(() => ({
  transform: `scale(${editorStore.zoom})`,
  transformOrigin: 'center center',
}))

// Initialize canvas
function initCanvas() {
  if (!canvasEl.value) return

  fabricCanvas = new Canvas(canvasEl.value, {
    width: editorStore.canvasSize.width,
    height: editorStore.canvasSize.height,
    backgroundColor: '#ffffff',
    preserveObjectStacking: true,
  })

  // Load base image if exists
  if (editorStore.image) {
    loadBaseImage()
  }

  // Handle object selection
  fabricCanvas.on('selection:created', handleSelection)
  fabricCanvas.on('selection:updated', handleSelection)
  fabricCanvas.on('selection:cleared', handleSelectionCleared)

  // Handle object modification
  fabricCanvas.on('object:modified', handleObjectModified)
}

// Load base image
async function loadBaseImage() {
  if (!fabricCanvas || !editorStore.image) return

  try {
    await addImageToCanvas(fabricCanvas, editorStore.image)
  } catch (error) {
    console.error('Failed to load image:', error)
  }
}

// Handle selection
function handleSelection(e: any) {
  const selected = e.selected?.[0]
  if (selected) {
    const layerId = selected.get('data-layer-id')
    if (layerId) {
      editorStore.setActiveLayer(layerId)
    }
  }
}

// Handle selection cleared
function handleSelectionCleared() {
  editorStore.setActiveLayer(null)
}

// Handle object modification
function handleObjectModified(e: any) {
  const obj = e.target
  const layerId = obj?.get('data-layer-id')
  if (!layerId || !fabricCanvas) return

  editorStore.updateLayer(layerId, {
    x: obj.left,
    y: obj.top,
    width: obj.width! * obj.scaleX!,
    height: obj.height! * obj.scaleY!,
    rotation: obj.angle,
  } as any)
}

// Add text watermark
function addTextWatermark(props: TextLayerProps) {
  if (!fabricCanvas) return

  const textbox = addTextToCanvas(fabricCanvas, props)
  const layerId = editorStore.layers[editorStore.layers.length - 1]?.id
  if (layerId) {
    textbox.set('data-layer-id', layerId)
    fabricObjects.set(layerId, textbox)
  }
}

// Add frame
function addFrame(props: FrameLayerProps) {
  if (!fabricCanvas) return

  addFrameToCanvas(
    fabricCanvas,
    props,
    editorStore.canvasSize.width,
    editorStore.canvasSize.height
  )
}

// Export image
function exportImage(format: 'png' | 'jpeg' = 'png') {
  if (!fabricCanvas) return

  const dataUrl = exportCanvas(fabricCanvas, format, settingsStore.settings.defaultExportQuality)
  const timestamp = Date.now()
  downloadImage(dataUrl, `framesnap-${timestamp}.${format}`)
}

// Fit canvas to container
function handleResize() {
  if (!containerRef.value || !fabricCanvas) return

  const containerWidth = containerRef.value.clientWidth - 40
  const containerHeight = containerRef.value.clientHeight - 40
  const scale = fitCanvasToContainer(fabricCanvas, containerWidth, containerHeight)
  editorStore.setZoom(scale)
}

// Watch for store changes
watch(
  () => editorStore.image,
  (newImage) => {
    if (newImage && fabricCanvas) {
      // Clear and reload
      fabricCanvas.clear()
      fabricCanvas.backgroundColor = '#ffffff'
      loadBaseImage()
    }
  }
)

watch(
  () => editorStore.layers,
  (layers) => {
    if (!fabricCanvas) return

    // Add new layers that don't have fabric objects
    layers.forEach((layer) => {
      if (!fabricObjects.has(layer.id)) {
        if (layer.type === 'text') {
          const textbox = addTextToCanvas(fabricCanvas!, layer.props as TextLayerProps)
          textbox.set('data-layer-id', layer.id)
          fabricObjects.set(layer.id, textbox)
        } else if (layer.type === 'frame') {
          const frameObjs = addFrameToCanvas(
            fabricCanvas!,
            layer.props as FrameLayerProps,
            editorStore.canvasSize.width,
            editorStore.canvasSize.height
          )
          if (frameObjs.length > 0) {
            frameObjs.forEach((obj) => {
              obj.set('data-layer-id', layer.id)
            })
            const firstObj = frameObjs[0]
            if (firstObj) {
              fabricObjects.set(layer.id, firstObj)
            }
          }
        }
      }
    })

    // Remove objects for deleted layers
    fabricObjects.forEach((obj, layerId) => {
      if (!layers.find((l) => l.id === layerId)) {
        fabricCanvas!.remove(obj)
        fabricObjects.delete(layerId)
      }
    })
  },
  { deep: true }
)

// Watch for zoom changes
watch(
  () => editorStore.zoom,
  () => {
    if (fabricCanvas) {
      fabricCanvas.setZoom(editorStore.zoom)
    }
  }
)

// Expose methods to parent
defineExpose({
  addTextWatermark,
  addFrame,
  exportImage,
})

onMounted(() => {
  initCanvas()
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  fabricCanvas?.dispose()
})
</script>

<template>
  <div ref="containerRef" class="canvas-container">
    <div class="canvas-wrapper" :style="canvasStyle">
      <canvas ref="canvasEl"></canvas>
    </div>
    <div v-if="!editorStore.image" class="empty-state">
      <p>请先上传图片</p>
    </div>
  </div>
</template>

<style scoped>
.canvas-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.canvas-wrapper {
  transition: transform 0.2s ease;
}

.canvas-wrapper canvas {
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.empty-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--text-secondary);
  text-align: center;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}
</style>
