// Core type definitions for FrameSnap

// ============= Layer Types =============

export type LayerType = "image" | "text" | "frame" | "collage" | "image-watermark";

export interface BaseLayer {
  id: string;
  type: LayerType;
  name: string;
  visible: boolean;
  lock: boolean;
}

export interface ImageLayer extends BaseLayer {
  type: "image";
  props: ImageLayerProps;
}

export interface TextLayer extends BaseLayer {
  type: "text";
  props: TextLayerProps;
}

export interface FrameLayer extends BaseLayer {
  type: "frame";
  props: FrameLayerProps;
}

export interface CollageLayer extends BaseLayer {
  type: "collage";
  props: CollageLayerProps;
}

export interface ImageWatermarkLayer extends BaseLayer {
  type: "image-watermark";
  props: ImageWatermarkLayerProps;
}

export type Layer = ImageLayer | TextLayer | FrameLayer | CollageLayer | ImageWatermarkLayer;

// ============= Layer Props =============

export interface ImageLayerProps {
  src: string; // base64
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
}

export interface TextLayerProps {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  fontStyle: "normal" | "italic";
  color: string;
  backgroundColor: string;
  opacity: number;
  rotation: number;
}

export interface FrameLayerProps {
  frameType: "border" | "blur" | "filter";
  borderWidth: number;
  borderColor: string;
  borderStyle: "solid" | "dashed" | "dotted";
  blurRadius: number;
  filterType: "grayscale" | "sepia" | "blur" | "brightness" | "contrast";
  filterIntensity: number;
}

export interface CollageLayerProps {
  layout: "grid" | "拼图" | "自由";
  columns: number;
  rows: number;
  gap: number;
  images: string[]; // base64 array
}

export interface ImageWatermarkLayerProps {
  src: string; // base64
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  rotation: number;
}

// ============= Position =============

export type WatermarkPosition =
  | "topLeft"
  | "topCenter"
  | "topRight"
  | "middleLeft"
  | "middleCenter"
  | "middleRight"
  | "bottomLeft"
  | "bottomCenter"
  | "bottomRight"
  | "custom";

// ============= Template Types =============

export type TemplateCategory = "watermark" | "frame" | "collage";

export interface Template {
  id: string;
  name: string;
  nameEn: string;
  category: TemplateCategory;
  thumbnail: string; // base64
  config: TemplateConfig;
  createdAt: number;
  isBuiltIn: boolean;
}

export interface TemplateConfig {
  layers: Layer[];
  canvas: {
    width: number;
    height: number;
    backgroundColor: string;
  };
}

// ============= Editor State =============

export interface CanvasSize {
  width: number;
  height: number;
}

export interface HistoryState {
  layers: Layer[];
  timestamp: number;
}

// ============= Export Types =============

export type ExportFormat = "png" | "jpeg";

export interface ExportOptions {
  format: ExportFormat;
  quality: number; // 0-1 for jpeg
  multiplier: number; // for retina export
}

// ============= Filter Types =============

export interface FilterConfig {
  type: "grayscale" | "sepia" | "blur" | "brightness" | "contrast" | "saturate";
  value: number;
}
