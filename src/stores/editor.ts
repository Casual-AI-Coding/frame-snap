import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type {
  Layer,
  ImageLayerProps,
  TextLayerProps,
  FrameLayerProps,
  CollageLayerProps,
  CanvasSize,
  HistoryState,
  WatermarkPosition,
} from '@/types'

const MAX_HISTORY = 50

export const useEditorStore = defineStore('editor', () => {
  // State
  const image = ref<string | null>(null)
  const originalImageSize = ref<{ width: number; height: number } | null>(null)
  const layers = ref<Layer[]>([])
  const activeLayerId = ref<string | null>(null)
  const zoom = ref(1)
  const canvasSize = ref<CanvasSize>({ width: 800, height: 600 })
  const history = ref<HistoryState[]>([])
  const historyIndex = ref(-1)

  // Getters
  const activeLayer = computed(() => {
    if (!activeLayerId.value) return null
    return layers.value.find((l) => l.id === activeLayerId.value) || null
  })

  const canUndo = computed(() => historyIndex.value > 0)
  const canRedo = computed(() => historyIndex.value < history.value.length - 1)

  // Actions
  function saveToHistory() {
    // Remove any future history if we're in the middle
    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1)
    }

    // Add current state
    const state: HistoryState = {
      layers: JSON.parse(JSON.stringify(layers.value)),
      timestamp: Date.now(),
    }
    history.value.push(state)

    // Limit history size
    if (history.value.length > MAX_HISTORY) {
      history.value.shift()
    } else {
      historyIndex.value++
    }
  }

  function setImage(src: string, width: number, height: number) {
    image.value = src
    originalImageSize.value = { width, height }
    canvasSize.value = { width, height }
    layers.value = []
    activeLayerId.value = null
    history.value = []
    historyIndex.value = -1
    saveToHistory()
  }

  function addImageLayer(props: Partial<ImageLayerProps> = {}) {
    const layer: Layer = {
      id: uuidv4(),
      type: 'image',
      name: `Image ${layers.value.filter((l) => l.type === 'image').length + 1}`,
      visible: true,
      lock: false,
      props: {
        src: image.value || '',
        x: 0,
        y: 0,
        width: canvasSize.value.width,
        height: canvasSize.value.height,
        rotation: 0,
        opacity: 1,
        ...props,
      },
    }
    layers.value.push(layer)
    activeLayerId.value = layer.id
    saveToHistory()
    return layer.id
  }

  function addTextWatermark(
    text: string,
    position: WatermarkPosition = 'bottomRight',
    options: Partial<TextLayerProps> = {}
  ) {
    const pos = calculatePosition(position, canvasSize.value.width, canvasSize.value.height)
    const layer: Layer = {
      id: uuidv4(),
      type: 'text',
      name: `Text ${layers.value.filter((l) => l.type === 'text').length + 1}`,
      visible: true,
      lock: false,
      props: {
        text,
        x: pos.x,
        y: pos.y,
        fontSize: 24,
        fontFamily: 'Arial',
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#ffffff',
        backgroundColor: 'transparent',
        opacity: 0.8,
        rotation: 0,
        ...options,
      },
    }
    layers.value.push(layer)
    activeLayerId.value = layer.id
    saveToHistory()
    return layer.id
  }

  function addFrame(props: Partial<FrameLayerProps> = {}) {
    const layer: Layer = {
      id: uuidv4(),
      type: 'frame',
      name: `Frame ${layers.value.filter((l) => l.type === 'frame').length + 1}`,
      visible: true,
      lock: false,
      props: {
        frameType: 'border',
        borderWidth: 10,
        borderColor: '#ffffff',
        borderStyle: 'solid',
        blurRadius: 0,
        filterType: 'grayscale',
        filterIntensity: 0,
        ...props,
      },
    }
    layers.value.push(layer)
    activeLayerId.value = layer.id
    saveToHistory()
    return layer.id
  }

  function addCollage(props: Partial<CollageLayerProps> = {}) {
    const layer: Layer = {
      id: uuidv4(),
      type: 'collage',
      name: `Collage ${layers.value.filter((l) => l.type === 'collage').length + 1}`,
      visible: true,
      lock: false,
      props: {
        layout: 'grid',
        columns: 2,
        rows: 2,
        gap: 10,
        images: [],
        ...props,
      },
    }
    layers.value.push(layer)
    activeLayerId.value = layer.id
    saveToHistory()
    return layer.id
  }

  function updateLayer(layerId: string, updates: Partial<Layer['props']>) {
    const layer = layers.value.find((l) => l.id === layerId)
    if (layer) {
      Object.assign(layer.props, updates)
    }
  }

  function deleteLayer(layerId: string) {
    const index = layers.value.findIndex((l) => l.id === layerId)
    if (index !== -1) {
      layers.value.splice(index, 1)
      if (activeLayerId.value === layerId) {
        activeLayerId.value = layers.value[0]?.id || null
      }
      saveToHistory()
    }
  }

  function setActiveLayer(layerId: string | null) {
    activeLayerId.value = layerId
  }

  function toggleLayerVisibility(layerId: string) {
    const layer = layers.value.find((l) => l.id === layerId)
    if (layer) {
      layer.visible = !layer.visible
      saveToHistory()
    }
  }

  function moveLayer(layerId: string, direction: 'up' | 'down') {
    const index = layers.value.findIndex((l) => l.id === layerId)
    if (index === -1) return

    const newIndex = direction === 'up' ? index + 1 : index - 1
    if (newIndex < 0 || newIndex >= layers.value.length) return

    const temp = layers.value[index]
    const target = layers.value[newIndex]
    if (temp && target) {
      layers.value[index] = target
      layers.value[newIndex] = temp
      saveToHistory()
    }
  }

  function setZoom(value: number) {
    zoom.value = Math.max(0.1, Math.min(5, value))
  }

  function undo() {
    if (!canUndo.value) return
    historyIndex.value--
    const state = history.value[historyIndex.value]
    if (state) {
      layers.value = JSON.parse(JSON.stringify(state.layers))
    }
    activeLayerId.value = null
  }

  function redo() {
    if (!canRedo.value) return
    historyIndex.value++
    const state = history.value[historyIndex.value]
    if (state) {
      layers.value = JSON.parse(JSON.stringify(state.layers))
    }
    activeLayerId.value = null
  }

  function clear() {
    image.value = null
    originalImageSize.value = null
    layers.value = []
    activeLayerId.value = null
    history.value = []
    historyIndex.value = -1
    canvasSize.value = { width: 800, height: 600 }
  }

  function loadFromTemplate(layersData: Layer[]) {
    layers.value = layersData
    activeLayerId.value = layers.value[0]?.id || null
    saveToHistory()
  }

  return {
    // State
    image,
    originalImageSize,
    layers,
    activeLayerId,
    zoom,
    canvasSize,
    history,
    historyIndex,

    // Getters
    activeLayer,
    canUndo,
    canRedo,

    // Actions
    setImage,
    addImageLayer,
    addTextWatermark,
    addFrame,
    addCollage,
    updateLayer,
    deleteLayer,
    setActiveLayer,
    toggleLayerVisibility,
    moveLayer,
    setZoom,
    undo,
    redo,
    clear,
    loadFromTemplate,
  }
})

// Helper function
function calculatePosition(
  position: WatermarkPosition,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } {
  const padding = 20

  switch (position) {
    case 'topLeft':
      return { x: padding, y: padding }
    case 'topCenter':
      return { x: canvasWidth / 2, y: padding }
    case 'topRight':
      return { x: canvasWidth - padding, y: padding }
    case 'middleLeft':
      return { x: padding, y: canvasHeight / 2 }
    case 'middleCenter':
      return { x: canvasWidth / 2, y: canvasHeight / 2 }
    case 'middleRight':
      return { x: canvasWidth - padding, y: canvasHeight / 2 }
    case 'bottomLeft':
      return { x: padding, y: canvasHeight - padding }
    case 'bottomCenter':
      return { x: canvasWidth / 2, y: canvasHeight - padding }
    case 'bottomRight':
      return { x: canvasWidth - padding, y: canvasHeight - padding }
    default:
      return { x: canvasWidth - padding, y: canvasHeight - padding }
  }
}
