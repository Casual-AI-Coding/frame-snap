import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEditorStore } from '../editor'

describe('EditorStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('initial state', () => {
    it('should have empty initial state', () => {
      const store = useEditorStore()
      
      expect(store.image).toBeNull()
      expect(store.layers).toEqual([])
      expect(store.activeLayerId).toBeNull()
      expect(store.zoom).toBe(1)
      expect(store.canvasSize).toEqual({ width: 800, height: 600 })
    })

    it('should have correct initial getters', () => {
      const store = useEditorStore()
      
      expect(store.activeLayer).toBeNull()
      expect(store.canUndo).toBe(false)
      expect(store.canRedo).toBe(false)
    })
  })

  describe('setImage', () => {
    it('should set image and initialize state', () => {
      const store = useEditorStore()
      const imageData = 'data:image/png;base64,mockImage'
      
      store.setImage(imageData, 1920, 1080)
      
      expect(store.image).toBe(imageData)
      expect(store.originalImageSize).toEqual({ width: 1920, height: 1080 })
      expect(store.canvasSize).toEqual({ width: 1920, height: 1080 })
    })

    it('should clear layers when setting new image', () => {
      const store = useEditorStore()
      
      store.setImage('data:image/png;base64,img1', 800, 600)
      store.addTextWatermark('Test', 'bottomRight')
      expect(store.layers.length).toBe(1)
      
      store.setImage('data:image/png;base64,img2', 1024, 768)
      expect(store.layers.length).toBe(0)
    })
  })

  describe('addTextWatermark', () => {
    it('should add text watermark layer', () => {
      const store = useEditorStore()
      store.setImage('data:image/png;base64,test', 800, 600)
      
      const layerId = store.addTextWatermark('© FrameSnap', 'bottomRight', {
        fontSize: 24,
        color: '#ffffff',
      })
      
      expect(store.layers.length).toBe(1)
      expect(store.layers[0].type).toBe('text')
      expect(store.layers[0].props.text).toBe('© FrameSnap')
      expect(store.activeLayerId).toBe(layerId)
    })

    it('should calculate correct position for different positions', () => {
      const store = useEditorStore()
      store.setImage('data:image/png;base64,test', 800, 600)
      
      store.addTextWatermark('Test', 'topLeft')
      expect(store.layers[0].props.x).toBe(20)
      expect(store.layers[0].props.y).toBe(20)
    })
  })

  describe('addFrame', () => {
    it('should add frame layer', () => {
      const store = useEditorStore()
      store.setImage('data:image/png;base64,test', 800, 600)
      
      store.addFrame({
        frameType: 'border',
        borderWidth: 20,
        borderColor: '#ffffff',
      })
      
      expect(store.layers.length).toBe(1)
      expect(store.layers[0].type).toBe('frame')
      expect(store.layers[0].props.frameType).toBe('border')
      expect(store.layers[0].props.borderWidth).toBe(20)
    })
  })

  describe('addCollage', () => {
    it('should add collage layer', () => {
      const store = useEditorStore()
      
      store.addCollage({
        layout: 'grid',
        columns: 2,
        rows: 2,
        gap: 5,
      })
      
      expect(store.layers.length).toBe(1)
      expect(store.layers[0].type).toBe('collage')
      expect(store.layers[0].props.layout).toBe('grid')
      expect(store.layers[0].props.columns).toBe(2)
    })
  })

  describe('layer management', () => {
    it('should update layer properties', () => {
      const store = useEditorStore()
      store.setImage('data:image/png;base64,test', 800, 600)
      
      const layerId = store.addTextWatermark('Test', 'bottomRight')
      store.updateLayer(layerId, { fontSize: 36 })
      
      expect(store.layers[0].props.fontSize).toBe(36)
    })

    it('should delete layer', () => {
      const store = useEditorStore()
      store.setImage('data:image/png;base64,test', 800, 600)
      
      const layerId = store.addTextWatermark('Test', 'bottomRight')
      expect(store.layers.length).toBe(1)
      
      store.deleteLayer(layerId)
      expect(store.layers.length).toBe(0)
    })

    it('should toggle layer visibility', () => {
      const store = useEditorStore()
      store.setImage('data:image/png;base64,test', 800, 600)
      
      const layerId = store.addTextWatermark('Test', 'bottomRight')
      expect(store.layers[0].visible).toBe(true)
      
      store.toggleLayerVisibility(layerId)
      expect(store.layers[0].visible).toBe(false)
    })

    it('should set active layer', () => {
      const store = useEditorStore()
      store.setImage('data:image/png;base64,test', 800, 600)
      
      const layerId = store.addTextWatermark('Test', 'bottomRight')
      store.setActiveLayer(null)
      expect(store.activeLayerId).toBeNull()
      
      store.setActiveLayer(layerId)
      expect(store.activeLayerId).toBe(layerId)
    })
  })

  describe('zoom', () => {
    it('should set zoom within bounds', () => {
      const store = useEditorStore()
      
      store.setZoom(2)
      expect(store.zoom).toBe(2)
      
      store.setZoom(0.05)
      expect(store.zoom).toBe(0.1) // min bound
      
      store.setZoom(10)
      expect(store.zoom).toBe(5) // max bound
    })
  })

  describe('history (undo/redo)', () => {
    it('should save state to history', () => {
      const store = useEditorStore()
      store.setImage('data:image/png;base64,test', 800, 600)
      
      expect(store.canUndo).toBe(false)
      
      store.addTextWatermark('Test', 'bottomRight')
      expect(store.canUndo).toBe(true)
    })

    it('should undo and redo', () => {
      const store = useEditorStore()
      store.setImage('data:image/png;base64,test', 800, 600)
      
      store.addTextWatermark('Test', 'bottomRight')
      expect(store.layers.length).toBe(1)
      
      store.undo()
      expect(store.layers.length).toBe(0)
      
      store.redo()
      expect(store.layers.length).toBe(1)
    })
  })

  describe('clear', () => {
    it('should clear all state', () => {
      const store = useEditorStore()
      store.setImage('data:image/png;base64,test', 800, 600)
      store.addTextWatermark('Test', 'bottomRight')
      store.setZoom(1.5)
      
      store.clear()
      
      expect(store.image).toBeNull()
      expect(store.layers).toEqual([])
      expect(store.canvasSize).toEqual({ width: 800, height: 600 })
    })
  })

  describe('loadFromTemplate', () => {
    it('should load layers from template', () => {
      const store = useEditorStore()
      const templateLayers = [
        {
          id: 'test-1',
          type: 'text' as const,
          name: 'Test',
          visible: true,
          lock: false,
          props: {
            text: 'Template Text',
            x: 100,
            y: 100,
            fontSize: 24,
            fontFamily: 'Arial',
            fontWeight: 'normal',
            fontStyle: 'normal',
            color: '#ffffff',
            backgroundColor: 'transparent',
            opacity: 1,
            rotation: 0,
          },
        },
      ]
      
      store.loadFromTemplate(templateLayers)
      
      expect(store.layers.length).toBe(1)
      expect(store.layers[0].props.text).toBe('Template Text')
    })
  })
})
