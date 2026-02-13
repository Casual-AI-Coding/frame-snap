<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import { useEditorStore, useSettingsStore } from "@/stores";
import { Canvas, FabricImage, type FabricObject } from "fabric";
import {
  addImageToCanvas,
  addTextToCanvas,
  addFrameToCanvas,
  addCollageToCanvas,
  exportCanvas,
  downloadImage,
  fitCanvasToContainer,
} from "@/utils/fabric";
import type { TextLayerProps, FrameLayerProps, ImageWatermarkLayerProps, CollageLayerProps, Layer } from "@/types";

const editorStore = useEditorStore();
const settingsStore = useSettingsStore();

const containerRef = ref<HTMLDivElement | null>(null);
const canvasEl = ref<HTMLCanvasElement | null>(null);
let fabricCanvas: Canvas | null = null;
const fabricObjects = new Map<string, FabricObject>();

const canvasStyle = computed(() => ({
  transform: `scale(${editorStore.zoom})`,
  transformOrigin: "center center",
}));

// Initialize canvas
function initCanvas() {
  if (!canvasEl.value) return;

  // Get container dimensions for initial canvas size
  const containerWidth = containerRef.value?.clientWidth || 800;
  const containerHeight = containerRef.value?.clientHeight || 600;
  
  // Calculate initial canvas size (max 800x600, maintain aspect ratio)
  const maxWidth = Math.min(containerWidth - 40, 800);
  const maxHeight = Math.min(containerHeight - 40, 600);

  fabricCanvas = new Canvas(canvasEl.value, {
    width: maxWidth,
    height: maxHeight,
    backgroundColor: "#ffffff",
    preserveObjectStacking: true,
  });

  // Load base image if exists
  if (editorStore.image) {
    loadBaseImage();
  }

  // Handle object selection
  fabricCanvas.on("selection:created", handleSelection);
  fabricCanvas.on("selection:updated", handleSelection);
  fabricCanvas.on("selection:cleared", handleSelectionCleared);

  // Handle object modification
  fabricCanvas.on("object:modified", handleObjectModified);
}

// Load base image
async function loadBaseImage() {
  if (!fabricCanvas || !editorStore.image) return;

  try {
    await addImageToCanvas(fabricCanvas, editorStore.image);
    // Recalculate zoom after image is loaded and canvas is resized
    handleResize();
  } catch (error) {
    console.error("Failed to load image:", error);
  }
}

// Handle selection
function handleSelection(e: any) {
  const selected = e.selected?.[0];
  if (selected) {
    const layerId = selected.get("data-layer-id");
    if (layerId) {
      editorStore.setActiveLayer(layerId);
    }
  }
}

// Handle selection cleared
function handleSelectionCleared() {
  editorStore.setActiveLayer(null);
}

// Handle object modification
function handleObjectModified(e: any) {
  const obj = e.target;
  const layerId = obj?.get("data-layer-id");
  if (!layerId || !fabricCanvas) return;

  editorStore.updateLayer(layerId, {
    x: obj.left,
    y: obj.top,
    width: obj.width! * obj.scaleX!,
    height: obj.height! * obj.scaleY!,
    rotation: obj.angle,
  } as any);
}

// Add text watermark
function addTextWatermark(props: TextLayerProps) {
  if (!fabricCanvas) return;

  // Get canvas dimensions
  const canvasWidth = fabricCanvas.width || 800;
  const canvasHeight = fabricCanvas.height || 600;

  // Use center position for simplicity
  const scaledProps = {
    ...props,
    x: canvasWidth / 2,
    y: canvasHeight / 2,
    fontSize: 24, // Fixed reasonable font size
  };

  const textbox = addTextToCanvas(fabricCanvas, scaledProps);
  const layerId = editorStore.layers[editorStore.layers.length - 1]?.id;
  if (layerId) {
    textbox.set("data-layer-id", layerId);
    fabricObjects.set(layerId, textbox);
  }
}

// Add frame
function addFrame(props: FrameLayerProps) {
  if (!fabricCanvas) return;

  addFrameToCanvas(
    fabricCanvas,
    props,
    editorStore.canvasSize.width,
    editorStore.canvasSize.height,
  );
}

// Add image watermark
async function addImageWatermarkToCanvas(
  canvas: Canvas,
  layer: Layer,
) {
  if (layer.type !== "image-watermark") return;

  const props = layer.props as ImageWatermarkLayerProps;
  try {
    const img = await FabricImage.fromURL(props.src, {
      crossOrigin: "anonymous",
    });

    img.set({
      left: props.x,
      top: props.y,
      opacity: props.opacity,
      angle: props.rotation,
      scaleX: props.width / (img.width || 1),
      scaleY: props.height / (img.height || 1),
    });

    img.set("data-layer-id", layer.id);
    canvas.add(img);
    fabricObjects.set(layer.id, img);
  } catch (error) {
    console.error("Failed to add image watermark:", error);
  }
}

// Export image
function exportImage(format: "png" | "jpeg" = "png") {
  if (!fabricCanvas) return;

  const dataUrl = exportCanvas(
    fabricCanvas,
    format,
    settingsStore.settings.defaultExportQuality,
  );
  const timestamp = Date.now();
  downloadImage(dataUrl, `framesnap-${timestamp}.${format}`);
}

// Fit canvas to container
function handleResize() {
  if (!containerRef.value || !fabricCanvas) return;

  const containerWidth = containerRef.value.clientWidth - 40;
  const containerHeight = containerRef.value.clientHeight - 40;
  const scale = fitCanvasToContainer(
    fabricCanvas,
    containerWidth,
    containerHeight,
  );
  editorStore.setZoom(scale);
}

// Watch for store changes
watch(
  () => editorStore.image,
  (newImage) => {
    if (newImage && fabricCanvas) {
      // Clear and reload
      fabricCanvas.clear();
      fabricCanvas.backgroundColor = "#ffffff";
      loadBaseImage();
    }
  },
);

// Watch for layer property changes and sync to canvas
watch(
  () => editorStore.activeLayer,
  (layer) => {
    if (!layer || !fabricCanvas) return;

    // Find the fabric object for this layer
    const fabricObj = fabricObjects.get(layer.id);
    if (!fabricObj) return;

    // Update properties based on layer type
    if (layer.type === "text") {
      const props = layer.props as TextLayerProps;
      fabricObj.set({
        text: props.text,
        fontSize: props.fontSize,
        fill: props.color,
        opacity: props.opacity,
      });
      fabricObj.setCoords();
    } else if (layer.type === "image-watermark") {
      const props = layer.props as ImageWatermarkLayerProps;
      fabricObj.set({
        opacity: props.opacity,
      });
      fabricObj.setCoords();
    } else if (layer.type === "frame") {
      // Re-apply frame with new properties
      const props = layer.props as FrameLayerProps;
      // Remove old frame objects
      const existingObjs = fabricCanvas
        .getObjects()
        .filter((obj) => obj.get("data-layer-id") === layer.id);
      existingObjs.forEach((obj) => fabricCanvas!.remove(obj));

      // Add new frame
      const frameObjs = addFrameToCanvas(
        fabricCanvas,
        props,
        editorStore.canvasSize.width,
        editorStore.canvasSize.height,
      );
      frameObjs.forEach((obj) => {
        obj.set("data-layer-id", layer.id);
      });
    }

    fabricCanvas.renderAll();
  },
);

watch(
  () => editorStore.layers,
  async (layers) => {
    if (!fabricCanvas) return;

    // Check if there's a collage layer
    const collageLayer = layers.find((l) => l.type === "collage");

    // If collage exists, handle it specially
    if (collageLayer) {
      const props = collageLayer.props as CollageLayerProps;

      // Clear existing objects and set up collage
      fabricObjects.forEach((obj) => {
        fabricCanvas!.remove(obj);
      });
      fabricObjects.clear();

      // Use actual canvas dimensions instead of original image size
      const canvasWidth = fabricCanvas!.width || 800;
      const canvasHeight = fabricCanvas!.height || 600;

      // Add collage images
      await addCollageToCanvas(
        fabricCanvas,
        props,
        canvasWidth,
        canvasHeight,
      );

      // Mark collage layer as handled
      const objs = fabricCanvas.getObjects();
      if (objs.length > 0) {
        objs.forEach((obj) => {
          obj.set("data-layer-id", collageLayer.id);
        });
        const firstObj = objs[0];
        if (firstObj) {
          fabricObjects.set(collageLayer.id, firstObj);
        }
      }
    } else {
      // Normal layer handling (non-collage mode)
      // Get actual canvas dimensions
      const canvasWidth = fabricCanvas!.width || 800;
      const canvasHeight = fabricCanvas!.height || 600;

      // Add new layers that don't have fabric objects
      layers.forEach((layer) => {
        if (!fabricObjects.has(layer.id)) {
          if (layer.type === "text") {
            // Scale text position to canvas size - use center for now
            const props = layer.props as TextLayerProps;
            const scaledProps = {
              ...props,
              x: canvasWidth / 2,
              y: canvasHeight / 2,
            };
            const textbox = addTextToCanvas(
              fabricCanvas!,
              scaledProps,
            );
            textbox.set("data-layer-id", layer.id);
            fabricObjects.set(layer.id, textbox);
          } else if (layer.type === "image-watermark") {
            // Handle image watermark - scale position and size
            const props = layer.props as ImageWatermarkLayerProps;
            const scaleX = canvasWidth / (editorStore.canvasSize.width || canvasWidth);
            const scaleY = canvasHeight / (editorStore.canvasSize.height || canvasHeight);
            const scaledProps = {
              ...props,
              x: props.x * scaleX,
              y: props.y * scaleY,
              width: props.width * scaleX,
              height: props.height * scaleY,
            };
            layer.props = scaledProps;
            addImageWatermarkToCanvas(fabricCanvas!, layer);
          } else if (layer.type === "frame") {
            // Scale frame border width to canvas size
            const props = layer.props as FrameLayerProps;
            const scale = Math.min(
              canvasWidth / (editorStore.canvasSize.width || canvasWidth),
              canvasHeight / (editorStore.canvasSize.height || canvasHeight),
            );
            const scaledProps = {
              ...props,
              borderWidth: Math.max(5, props.borderWidth * scale),
            };
            const frameObjs = addFrameToCanvas(
              fabricCanvas!,
              scaledProps,
              canvasWidth,
              canvasHeight,
            );
            if (frameObjs.length > 0) {
              frameObjs.forEach((obj) => {
                obj.set("data-layer-id", layer.id);
              });
              const firstObj = frameObjs[0];
              if (firstObj) {
                fabricObjects.set(layer.id, firstObj);
              }
            }
          }
        }
      });

      // Remove objects for deleted layers
      fabricObjects.forEach((obj, layerId) => {
        if (!layers.find((l) => l.id === layerId)) {
          fabricCanvas!.remove(obj);
          fabricObjects.delete(layerId);
        }
      });
    }
  },
  { deep: true },
);

// Watch for zoom changes - only for external zoom control, don't modify canvas
// The CSS transform already handles the visual scaling
watch(
  () => editorStore.zoom,
  () => {
    // Just trigger a re-render if needed, don't call setZoom
    // The CSS transform handles the visual scaling
  },
);

// Expose methods to parent
defineExpose({
  addTextWatermark,
  addFrame,
  exportImage,
});

onMounted(() => {
  initCanvas();
  
  // Call handleResize after a short delay to ensure canvas is ready
  // If image is loaded, loadBaseImage will call handleResize again
  setTimeout(() => {
    if (editorStore.image) {
      // Image will trigger handleResize after loading
    } else {
      // No image, calculate zoom based on default canvas size
      handleResize();
    }
  }, 100);
  
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  fabricCanvas?.dispose();
});
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
