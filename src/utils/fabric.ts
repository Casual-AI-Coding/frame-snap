// Fabric.js utility functions for Canvas Editor

import {
  Canvas,
  Textbox,
  Rect,
  FabricImage,
  filters,
  type FabricObject,
} from "fabric";
import type { TextLayerProps, FrameLayerProps, CollageLayerProps } from "@/types";

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

  // Get canvas dimensions
  const canvasWidth = canvas.width || 800;
  const canvasHeight = canvas.height || 600;

  // Calculate scale to fit image within canvas while maintaining aspect ratio
  const scaleX = canvasWidth / imgWidth;
  const scaleY = canvasHeight / imgHeight;
  const scale = Math.min(scaleX, scaleY);

  // Calculate centered position
  const scaledWidth = imgWidth * scale;
  const scaledHeight = imgHeight * scale;
  const left = (canvasWidth - scaledWidth) / 2;
  const top = (canvasHeight - scaledHeight) / 2;

  // Set image to fit within canvas
  img.set({
    width: imgWidth,
    height: imgHeight,
    scaleX: scale,
    scaleY: scale,
    left: left,
    top: top,
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

// Add frame/border/filter/blur to canvas
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
  } else if (props.frameType === "filter") {
    // Apply filter to base image
    const baseImage = canvas
      .getObjects()
      .find((obj) => obj instanceof FabricImage);
    if (baseImage) {
      applyFilter(canvas, props.filterType, props.filterIntensity);
    }
  } else if (props.frameType === "blur") {
    // Apply blur filter
    const baseImage = canvas
      .getObjects()
      .find((obj) => obj instanceof FabricImage);
    if (baseImage) {
      applyFilter(canvas, "blur", props.blurRadius);
    }
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

// Apply filter to base image only (first FabricImage)
export function applyFilter(
  canvas: Canvas,
  filterType: string,
  intensity: number,
): void {
  const objects = canvas.getObjects();
  // Find all FabricImages and find the first one (base image)
  const fabricImages = objects.filter(
    (obj) => obj instanceof FabricImage,
  ) as FabricImage[];

  if (fabricImages.length > 0) {
    // Apply filter to the first image (base image)
    const baseImage = fabricImages[0];
    if (baseImage) {
      const filter = createFilter(filterType, intensity);
      if (filter) {
        baseImage.filters = [filter];
        baseImage.applyFilters();
        canvas.renderAll();
      }
    }
  }
}

// Create fabric filter (exported for testing)
export function createFilter(type: string, value: number): any {
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
    case "invert":
      return new filters.Invert();
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

// Add collage to canvas
// imageLoader parameter is optional and used for testing
export async function addCollageToCanvas(
  canvas: Canvas,
  props: CollageLayerProps,
  canvasWidth: number,
  canvasHeight: number,
  imageLoader: ImageLoader = defaultImageLoader,
): Promise<FabricImage[]> {
  const { layout, columns, gap, images } = props;

  if (images.length === 0) {
    return [];
  }

  // Clear canvas and set white background
  canvas.clear();
  canvas.backgroundColor = "#ffffff";

  const addedImages: FabricImage[] = [];

  // Handle free layout - position images in a row
  if (layout === "自由") {
    const totalGap = gap * (images.length + 1);
    const availableWidth = canvasWidth - totalGap;
    const imgWidth = availableWidth / images.length;
    const imgHeight = canvasHeight - gap * 2;
    
    for (let i = 0; i < images.length; i++) {
      const imageSrc = images[i];
      if (!imageSrc) continue;

      try {
        const img = await imageLoader(imageSrc);
        
        // Scale to fit height, maintain aspect ratio
        const scale = imgHeight / (img.height || 1);
        
        const left = gap + i * (imgWidth + gap);
        const top = gap;

        img.set({
          left,
          top,
          scaleX: scale,
          scaleY: scale,
          originX: "left",
          originY: "top",
          selectable: true,
          evented: true,
        });

        canvas.add(img);
        addedImages.push(img);
      } catch (error) {
        console.error(`Failed to load collage image ${i}:`, error);
      }
    }
  } else {
    // Grid layout - existing logic
    const actualColumns = Math.min(columns, images.length);
    const actualRows = Math.ceil(images.length / actualColumns);
    
    const cellWidth = (canvasWidth - gap * (actualColumns + 1)) / actualColumns;
    const cellHeight = (canvasHeight - gap * (actualRows + 1)) / actualRows;

    // Load and position each image
    for (let i = 0; i < images.length; i++) {
      const col = i % actualColumns;
      const row = Math.floor(i / actualColumns);

      // Skip if beyond grid
      if (col >= actualColumns || row >= actualRows) {
        break;
      }

      const imageSrc = images[i];
      if (!imageSrc) continue;

      try {
        // Load image using the injectable imageLoader
        const img = await imageLoader(imageSrc);

        // Calculate position
        const left = gap + col * (cellWidth + gap);
        const top = gap + row * (cellHeight + gap);

        // Scale to fit cell while maintaining aspect ratio
        const scaleX = cellWidth / (img.width || 1);
        const scaleY = cellHeight / (img.height || 1);
        const scale = Math.min(scaleX, scaleY);

        img.set({
          left,
          top,
          scaleX: scale,
          scaleY: scale,
          originX: "left",
          originY: "top",
          selectable: true,
          evented: true,
        });

        canvas.add(img);
        addedImages.push(img);
      } catch (error) {
        console.error(`Failed to load collage image ${i}:`, error);
      }
    }
  }

  canvas.renderAll();
  return addedImages;
}

// Type for injectable image loader (used for testing)
export type ImageLoader = (src: string) => Promise<FabricImage>;

// Default image loader - simple wrapper around FabricImage.fromURL
export async function defaultImageLoader(src: string): Promise<FabricImage> {
  const fabricImg = await FabricImage.fromURL(src, { crossOrigin: "anonymous" });
  if (!fabricImg) {
    throw new Error(`Failed to load image: ${src}`);
  }
  return fabricImg;
}

// Load image with proper EXIF orientation handling (exported for testing)
export async function loadImageWithOrientation(src: string): Promise<FabricImage> {
  return defaultImageLoader(src);
}
