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
export async function addCollageToCanvas(
  canvas: Canvas,
  props: CollageLayerProps,
  canvasWidth: number,
  canvasHeight: number,
): Promise<FabricImage[]> {
  const { columns, gap, images } = props;

  if (images.length === 0) {
    return [];
  }

  // Calculate cell dimensions - adjust grid to fit actual image count
  const actualColumns = Math.min(columns, images.length);
  const actualRows = Math.ceil(images.length / actualColumns);
  
  const cellWidth = (canvasWidth - gap * (actualColumns + 1)) / actualColumns;
  const cellHeight = (canvasHeight - gap * (actualRows + 1)) / actualRows;

  // Clear canvas and set white background
  canvas.clear();
  canvas.backgroundColor = "#ffffff";

  const addedImages: FabricImage[] = [];

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
      // Load image with EXIF orientation handling
      const img = await loadImageWithOrientation(imageSrc);

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

  canvas.renderAll();
  return addedImages;
}

// Load image with proper EXIF orientation handling
async function loadImageWithOrientation(src: string): Promise<FabricImage> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      // Create a canvas to handle EXIF orientation
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      // Get orientation from image (default to 1 if not present)
      const orientation = (img as any).orientation || 1;
      
      // Set canvas size based on orientation
      if (orientation >= 5 && orientation <= 8) {
        canvas.width = img.height;
        canvas.height = img.width;
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }

      // Apply orientation transformation
      switch (orientation) {
        case 2:
          ctx.transform(-1, 0, 0, 1, canvas.width, 0);
          break;
        case 3:
          ctx.transform(-1, 0, 0, -1, canvas.width, canvas.height);
          break;
        case 4:
          ctx.transform(1, 0, 0, -1, 0, canvas.height);
          break;
        case 5:
          ctx.transform(0, 1, 1, 0, 0, 0);
          break;
        case 6:
          ctx.transform(0, 1, -1, 0, canvas.width, 0);
          break;
        case 7:
          ctx.transform(0, -1, -1, 0, canvas.width, canvas.height);
          break;
        case 8:
          ctx.transform(0, -1, 1, 0, 0, canvas.height);
          break;
        default:
          // No transformation needed
          break;
      }

      // Draw the image
      ctx.drawImage(img, 0, 0);

      // Create FabricImage from the canvas
      FabricImage.fromURL(canvas.toDataURL(), {
        crossOrigin: "anonymous",
      })
        .then((fabricImg) => {
          resolve(fabricImg);
        })
        .catch(reject);
    };

    img.onerror = () => {
      reject(new Error(`Failed to load image: ${src}`));
    };

    img.src = src;
  });
}
