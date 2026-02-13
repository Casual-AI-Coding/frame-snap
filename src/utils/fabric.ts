// Fabric.js utility functions for Canvas Editor

import { Canvas, Textbox, Rect, FabricImage, filters, type FabricObject } from 'fabric'
import type { TextLayerProps, FrameLayerProps } from '@/types'

// Create a new Fabric canvas
export function createCanvas(
  canvasEl: HTMLCanvasElement,
  width: number,
  height: number,
  backgroundColor: string = '#ffffff'
): Canvas {
  return new Canvas(canvasEl, {
    width,
    height,
    backgroundColor,
    preserveObjectStacking: true,
    selection: true,
  })
}

// Add base image to canvas
export async function addImageToCanvas(
  canvas: Canvas,
  imageSrc: string
): Promise<FabricImage> {
  return new Promise((resolve, reject) => {
    const imgEl = new window.Image()
    imgEl.crossOrigin = 'anonymous'
    imgEl.onload = () => {
      try {
        // Create fabric image from HTML image element
        const fabricImage = new FabricImage(imgEl)
        
        fabricImage.set({
          left: 0,
          top: 0,
          selectable: false,
          evented: false,
        })
        
        // Scale image to fit canvas maintaining aspect ratio
        const canvasWidth = canvas.width || 800
        const canvasHeight = canvas.height || 600
        const imgWidth = imgEl.width
        const imgHeight = imgEl.height
        
        const scaleX = canvasWidth / imgWidth
        const scaleY = canvasHeight / imgHeight
        const scale = Math.min(scaleX, scaleY, 1) // Don't scale up, only fit if larger
        
        fabricImage.scale(scale)
        
        // Center the image
        const scaledWidth = imgWidth * scale
        const scaledHeight = imgHeight * scale
        fabricImage.set({
          left: (canvasWidth - scaledWidth) / 2,
          top: (canvasHeight - scaledHeight) / 2,
        })
        
        canvas.add(fabricImage)
        canvas.renderAll()
        resolve(fabricImage)
      } catch (error) {
        reject(error)
      }
    }
    imgEl.onerror = () => reject(new Error('Failed to load image'))
    imgEl.src = imageSrc
  })
}

// Add text watermark to canvas
export function addTextToCanvas(
  canvas: Canvas,
  props: TextLayerProps
): Textbox {
  const textbox = new Textbox(props.text, {
    left: props.x,
    top: props.y,
    fontSize: props.fontSize,
    fontFamily: props.fontFamily,
    fontWeight: props.fontWeight,
    fontStyle: props.fontStyle,
    fill: props.color,
    backgroundColor: props.backgroundColor === 'transparent' ? undefined : props.backgroundColor,
    opacity: props.opacity,
    angle: props.rotation,
    originX: 'center',
    originY: 'center',
  })
  canvas.add(textbox)
  canvas.setActiveObject(textbox)
  canvas.renderAll()
  return textbox
}

// Add frame/border to canvas
export function addFrameToCanvas(
  canvas: Canvas,
  props: FrameLayerProps,
  canvasWidth: number,
  canvasHeight: number
): Rect[] {
  const frames: Rect[] = []

  if (props.frameType === 'border') {
    // Create border rectangles
    const strokeWidth = props.borderWidth

    // Top border
    const top = new Rect({
      left: 0,
      top: 0,
      width: canvasWidth,
      height: strokeWidth,
      fill: props.borderColor,
      selectable: false,
      evented: false,
    })

    // Bottom border
    const bottom = new Rect({
      left: 0,
      top: canvasHeight - strokeWidth,
      width: canvasWidth,
      height: strokeWidth,
      fill: props.borderColor,
      selectable: false,
      evented: false,
    })

    // Left border
    const left = new Rect({
      left: 0,
      top: 0,
      width: strokeWidth,
      height: canvasHeight,
      fill: props.borderColor,
      selectable: false,
      evented: false,
    })

    // Right border
    const right = new Rect({
      left: canvasWidth - strokeWidth,
      top: 0,
      width: strokeWidth,
      height: canvasHeight,
      fill: props.borderColor,
      selectable: false,
      evented: false,
    })

    canvas.add(top, bottom, left, right)
    frames.push(top, bottom, left, right)
  }

  canvas.renderAll()
  return frames
}

// Export canvas to data URL
export function exportCanvas(
  canvas: Canvas,
  format: 'png' | 'jpeg' = 'png',
  quality: number = 1,
  multiplier: number = 1
): string {
  return canvas.toDataURL({
    format,
    quality,
    multiplier,
  })
}

// Download exported image
export function downloadImage(dataUrl: string, filename: string): void {
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Clear all objects except background
export function clearCanvas(canvas: Canvas): void {
  const objects = canvas.getObjects()
  objects.forEach((obj) => {
    canvas.remove(obj)
  })
  canvas.renderAll()
}

// Sync canvas objects to store layers
export function syncLayersFromCanvas(canvas: Canvas, layerIds: string[]): void {
  const objects = canvas.getObjects()
  // Map fabric objects to layer IDs
  objects.forEach((obj, index) => {
    if (layerIds[index]) {
      (obj as FabricObject).set('data-layer-id', layerIds[index])
    }
  })
}

// Apply filter to image
export function applyFilter(
  canvas: Canvas,
  filterType: string,
  intensity: number
): void {
  const objects = canvas.getObjects()
  objects.forEach((obj) => {
    if (obj instanceof FabricImage) {
      const filter = createFilter(filterType, intensity)
      if (filter) {
        obj.filters = [filter]
        obj.applyFilters()
        canvas.renderAll()
      }
    }
  })
}

// Create fabric filter
function createFilter(type: string, value: number): any {
  switch (type) {
    case 'grayscale':
      return new filters.Grayscale()
    case 'sepia':
      return new filters.Sepia()
    case 'blur':
      return new filters.Blur({ blurValue: value / 100 })
    case 'brightness':
      return new filters.Brightness({ brightness: value / 100 - 0.5 })
    case 'contrast':
      return new filters.Contrast({ contrast: value / 100 - 0.5 })
    default:
      return null
  }
}

// Get canvas center
export function getCanvasCenter(canvas: Canvas): { x: number; y: number } {
  return {
    x: canvas.width! / 2,
    y: canvas.height! / 2,
  }
}

// Fit canvas to container
export function fitCanvasToContainer(
  canvas: Canvas,
  containerWidth: number,
  containerHeight: number
): number {
  const canvasWidth = canvas.width!
  const canvasHeight = canvas.height!

  const scaleX = containerWidth / canvasWidth
  const scaleY = containerHeight / canvasHeight
  const scale = Math.min(scaleX, scaleY, 1) // Don't scale up, only scale down

  return scale
}
