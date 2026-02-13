// Fabric.js utility functions for Canvas Editor

import {
  Canvas,
  Textbox,
  Rect,
  FabricImage,
  filters,
  type FabricObject,
} from "fabric";
import type { TextLayerProps, FrameLayerProps } from "@/types";

// Create a new Fabric canvas
export function createCanvas(
  canvasEl: HTMLCanvasElement,
  width: number,
  height: number,
  backgroundColor: string = "#ffffff",
): Canvas {
  return new Canvas(canvasEl, {
    width,
    height,
    backgroundColor,
    preserveObjectStacking: true,
    selection: true,
  });
}

// Add base image to canvas - returns image dimensions
export async function addImageToCanvas(
  canvas: Canvas,
  imageSrc: string,
): Promise<FabricImage> {
  return new Promise((resolve, reject) => {
    // Use FabricImage.fromURL for Fabric.js v6+
    FabricImage.fromURL(imageSrc, {
      crossOrigin: "anonymous",
    })
      .then((img) => {
        if (!img) {
          reject(new Error("Failed to create image"));
          return;
        }

        // Get image element - cast to HTMLImageElement since we know it's an image
        const el = img.getElement() as HTMLImageElement;
        
        // Always wait for load event to ensure we get correct dimensions
        if (el && typeof el.addEventListener === "function") {
          // Check if already loaded
          if (el.complete && el.naturalWidth > 0) {
            // Already loaded, process immediately
            processImage(img, el, canvas, resolve, reject);
          } else {
            // Wait for load
            el.addEventListener("load", function onLoad() {
              el.removeEventListener("load", onLoad);
              processImage(img, el, canvas, resolve, reject);
            });
            
            el.addEventListener("error", function onError() {
              el.removeEventListener("error", onError);
              reject(new Error("Failed to load image"));
            });
          }
        } else if (el) {
          // No addEventListener, try direct dimensions
          const imgWidth = el.naturalWidth || (el as any).width || 0;
          const imgHeight = el.naturalHeight || (el as any).height || 0;
          
          if (imgWidth === 0 || imgHeight === 0) {
            reject(new Error("Image has no dimensions"));
            return;
          }
          
          processImage(img, el, canvas, resolve, reject);
        } else {
          // No element found
          reject(new Error("Failed to get image element"));
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// Helper function to process and add image to canvas
function processImage(
  img: FabricImage,
  el: HTMLImageElement,
  canvas: Canvas,
  resolve: (value: FabricImage) => void,
  reject: (reason?: any) => void
) {
  const imgWidth = el.naturalWidth;
  const imgHeight = el.naturalHeight;

  if (imgWidth === 0 || imgHeight === 0) {
    reject(new Error("Image has no dimensions"));
    return;
  }

  // Resize canvas to match image dimensions (if method exists)
  if (typeof canvas.setDimensions === "function") {
    canvas.setDimensions({ width: imgWidth, height: imgHeight });
  } else {
    // Fallback for older Fabric.js versions
    (canvas as any).width = imgWidth;
    (canvas as any).height = imgHeight;
  }
  
  // Set image dimensions explicitly to match canvas
  img.set({
    width: imgWidth,
    height: imgHeight,
    scaleX: 1,
    scaleY: 1,
    left: 0,
    top: 0,
    originX: "left",
    originY: "top",
    selectable: false,
    evented: false,
  });

  // Add to canvas and render
  canvas.add(img);
  canvas.renderAll();
  resolve(img);
}

// Add text watermark to canvas
export function addTextToCanvas(
  canvas: Canvas,
  props: TextLayerProps,
): Textbox {
  const textbox = new Textbox(props.text, {
    left: props.x,
    top: props.y,
    fontSize: props.fontSize,
    fontFamily: props.fontFamily,
    fontWeight: props.fontWeight,
    fontStyle: props.fontStyle,
    fill: props.color,
    backgroundColor:
      props.backgroundColor === "transparent"
        ? undefined
        : props.backgroundColor,
    opacity: props.opacity,
    angle: props.rotation,
    originX: "center",
    originY: "center",
  });
  canvas.add(textbox);
  canvas.setActiveObject(textbox);
  canvas.renderAll();
  return textbox;
}

// Add frame/border to canvas
export function addFrameToCanvas(
  canvas: Canvas,
  props: FrameLayerProps,
  canvasWidth: number,
  canvasHeight: number,
): Rect[] {
  const frames: Rect[] = [];

  if (props.frameType === "border") {
    // Create border rectangles
    const strokeWidth = props.borderWidth;

    // Top border
    const top = new Rect({
      left: 0,
      top: 0,
      width: canvasWidth,
      height: strokeWidth,
      fill: props.borderColor,
      selectable: false,
      evented: false,
    });

    // Bottom border
    const bottom = new Rect({
      left: 0,
      top: canvasHeight - strokeWidth,
      width: canvasWidth,
      height: strokeWidth,
      fill: props.borderColor,
      selectable: false,
      evented: false,
    });

    // Left border
    const left = new Rect({
      left: 0,
      top: 0,
      width: strokeWidth,
      height: canvasHeight,
      fill: props.borderColor,
      selectable: false,
      evented: false,
    });

    // Right border
    const right = new Rect({
      left: canvasWidth - strokeWidth,
      top: 0,
      width: strokeWidth,
      height: canvasHeight,
      fill: props.borderColor,
      selectable: false,
      evented: false,
    });

    canvas.add(top, bottom, left, right);
    frames.push(top, bottom, left, right);
  }

  canvas.renderAll();
  return frames;
}

// Export canvas to data URL
export function exportCanvas(
  canvas: Canvas,
  format: "png" | "jpeg" = "png",
  quality: number = 1,
  multiplier: number = 1,
): string {
  return canvas.toDataURL({
    format,
    quality,
    multiplier,
  });
}

// Download exported image
export function downloadImage(dataUrl: string, filename: string): void {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Clear all objects except background
export function clearCanvas(canvas: Canvas): void {
  const objects = canvas.getObjects();
  objects.forEach((obj) => {
    canvas.remove(obj);
  });
  canvas.renderAll();
}

// Sync canvas objects to store layers
export function syncLayersFromCanvas(canvas: Canvas, layerIds: string[]): void {
  const objects = canvas.getObjects();
  // Map fabric objects to layer IDs
  objects.forEach((obj, index) => {
    if (layerIds[index]) {
      (obj as FabricObject).set("data-layer-id", layerIds[index]);
    }
  });
}

// Apply filter to image
export function applyFilter(
  canvas: Canvas,
  filterType: string,
  intensity: number,
): void {
  const objects = canvas.getObjects();
  objects.forEach((obj) => {
    if (obj instanceof FabricImage) {
      const filter = createFilter(filterType, intensity);
      if (filter) {
        obj.filters = [filter];
        obj.applyFilters();
        canvas.renderAll();
      }
    }
  });
}

// Create fabric filter
function createFilter(type: string, value: number): any {
  switch (type) {
    case "grayscale":
      return new filters.Grayscale();
    case "sepia":
      return new filters.Sepia();
    case "blur":
      return new filters.Blur({ blurValue: value / 100 });
    case "brightness":
      return new filters.Brightness({ brightness: value / 100 - 0.5 });
    case "contrast":
      return new filters.Contrast({ contrast: value / 100 - 0.5 });
    default:
      return null;
  }
}

// Get canvas center
export function getCanvasCenter(canvas: Canvas): { x: number; y: number } {
  return {
    x: canvas.width! / 2,
    y: canvas.height! / 2,
  };
}

// Fit canvas to container
export function fitCanvasToContainer(
  canvas: Canvas,
  containerWidth: number,
  containerHeight: number,
): number {
  const canvasWidth = canvas.width!;
  const canvasHeight = canvas.height!;

  const scaleX = containerWidth / canvasWidth;
  const scaleY = containerHeight / canvasHeight;
  const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only scale down

  return scale;
}
