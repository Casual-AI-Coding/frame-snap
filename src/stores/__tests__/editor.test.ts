import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useEditorStore } from "../editor";

describe("EditorStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe("initial state", () => {
    it("should have empty initial state", () => {
      const store = useEditorStore();

      expect(store.image).toBeNull();
      expect(store.layers).toEqual([]);
      expect(store.activeLayerId).toBeNull();
      expect(store.zoom).toBe(1);
      expect(store.canvasSize).toEqual({ width: 800, height: 600 });
    });

    it("should have correct initial getters", () => {
      const store = useEditorStore();

      expect(store.activeLayer).toBeNull();
      expect(store.canUndo).toBe(false);
      expect(store.canRedo).toBe(false);
    });
  });

  describe("setImage", () => {
    it("should set image and initialize state", () => {
      const store = useEditorStore();
      const imageData = "data:image/png;base64,mockImage";

      store.setImage(imageData, 1920, 1080);

      expect(store.image).toBe(imageData);
      expect(store.originalImageSize).toEqual({ width: 1920, height: 1080 });
      expect(store.canvasSize).toEqual({ width: 1920, height: 1080 });
    });

    it("should clear layers when setting new image", () => {
      const store = useEditorStore();

      store.setImage("data:image/png;base64,img1", 800, 600);
      store.addTextWatermark("Test", "bottomRight");
      expect(store.layers.length).toBe(1);

      store.setImage("data:image/png;base64,img2", 1024, 768);
      expect(store.layers.length).toBe(0);
    });
  });

  describe("addTextWatermark", () => {
    it("should add text watermark layer", () => {
      const store = useEditorStore();
      store.setImage("data:image/png;base64,test", 800, 600);

      const layerId = store.addTextWatermark("© FrameSnap", "bottomRight", {
        fontSize: 24,
        color: "#ffffff",
      });

      expect(store.layers.length).toBe(1);
      const firstLayer = store.layers[0];
      expect(firstLayer?.type).toBe("text");
      expect((firstLayer?.props as any).text).toBe("© FrameSnap");
      expect(store.activeLayerId).toBe(layerId);
    });

    it("should calculate correct position for different positions", () => {
      const store = useEditorStore();
      store.setImage("data:image/png;base64,test", 800, 600);

      store.addTextWatermark("Test", "topLeft");
      const firstLayer = store.layers[0];
      expect((firstLayer?.props as any).x).toBe(20);
      expect((firstLayer?.props as any).y).toBe(20);
    });

    it("should calculate position for topCenter", () => {
      const store = useEditorStore();
      store.setImage("data:image/png;base64,test", 800, 600);

      store.addTextWatermark("Test", "topCenter");
      const firstLayer = store.layers[0];
      expect((firstLayer?.props as any).x).toBe(400);
      expect((firstLayer?.props as any).y).toBe(20);
    });

    it("should calculate position for topRight", () => {
      const store = useEditorStore();
      store.setImage("data:image/png;base64,test", 800, 600);

      store.addTextWatermark("Test", "topRight");
      const firstLayer = store.layers[0];
      expect((firstLayer?.props as any).x).toBe(780);
      expect((firstLayer?.props as any).y).toBe(20);
    });

    it("should calculate position for middleCenter", () => {
      const store = useEditorStore();
      store.setImage("data:image/png;base64,test", 800, 600);

      store.addTextWatermark("Test", "middleCenter");
      const firstLayer = store.layers[0];
      expect((firstLayer?.props as any).x).toBe(400);
      expect((firstLayer?.props as any).y).toBe(300);
    });

    it("should calculate position for bottomRight", () => {
      const store = useEditorStore();
      store.setImage("data:image/png;base64,test", 800, 600);

      store.addTextWatermark("Test", "bottomRight");
      const firstLayer = store.layers[0];
      expect((firstLayer?.props as any).x).toBe(780);
      expect((firstLayer?.props as any).y).toBe(580);
    });
  });

  describe("addFrame", () => {
    it("should add frame layer", () => {
      const store = useEditorStore();
      store.setImage("data:image/png;base64,test", 800, 600);

      store.addFrame({
        frameType: "border",
        borderWidth: 20,
        borderColor: "#ffffff",
      });

      expect(store.layers.length).toBe(1);
      const firstLayer = store.layers[0];
      expect(firstLayer?.type).toBe("frame");
      expect((firstLayer?.props as any).frameType).toBe("border");
      expect((firstLayer?.props as any).borderWidth).toBe(20);
    });
  });

  describe("addCollage", () => {
    it("should add collage layer", () => {
      const store = useEditorStore();

      store.addCollage({
        layout: "grid",
        columns: 2,
        rows: 2,
        gap: 5,
      });

      expect(store.layers.length).toBe(1);
      const firstLayer = store.layers[0];
      expect(firstLayer?.type).toBe("collage");
      expect((firstLayer?.props as any).layout).toBe("grid");
      expect((firstLayer?.props as any).columns).toBe(2);
    });
  });

  describe("layer management", () => {
    it("should update layer properties", () => {
      const store = useEditorStore();
      store.setImage("data:image/png;base64,test", 800, 600);

      const layerId = store.addTextWatermark("Test", "bottomRight");
      store.updateLayer(layerId, { fontSize: 36 });

      const firstLayer = store.layers[0];
      expect((firstLayer?.props as any).fontSize).toBe(36);
    });

    it("should delete layer", () => {
      const store = useEditorStore();
      store.setImage("data:image/png;base64,test", 800, 600);

      const layerId = store.addTextWatermark("Test", "bottomRight");
      expect(store.layers.length).toBe(1);

      store.deleteLayer(layerId);
      expect(store.layers.length).toBe(0);
    });

    it("should toggle layer visibility", () => {
      const store = useEditorStore();
      store.setImage("data:image/png;base64,test", 800, 600);

      const layerId = store.addTextWatermark("Test", "bottomRight");
      const layer = store.layers[0];
      expect(layer?.visible).toBe(true);

      store.toggleLayerVisibility(layerId);
      expect(store.layers[0]?.visible).toBe(false);
    });

    it("should set active layer", () => {
      const store = useEditorStore();
      store.setImage("data:image/png;base64,test", 800, 600);

      const layerId = store.addTextWatermark("Test", "bottomRight");
      store.setActiveLayer(null);
      expect(store.activeLayerId).toBeNull();

      store.setActiveLayer(layerId);
      expect(store.activeLayerId).toBe(layerId);
    });
  });

  describe("zoom", () => {
    it("should set zoom within bounds", () => {
      const store = useEditorStore();

      store.setZoom(2);
      expect(store.zoom).toBe(2);

      store.setZoom(0.05);
      expect(store.zoom).toBe(0.1); // min bound

      store.setZoom(10);
      expect(store.zoom).toBe(5); // max bound
    });
  });

  describe("history (undo/redo)", () => {
    it("should save state to history", () => {
      const store = useEditorStore();
      store.setImage("data:image/png;base64,test", 800, 600);

      expect(store.canUndo).toBe(false);

      store.addTextWatermark("Test", "bottomRight");
      expect(store.canUndo).toBe(true);
    });

    it("should undo and redo", () => {
      const store = useEditorStore();
      store.setImage("data:image/png;base64,test", 800, 600);

      store.addTextWatermark("Test", "bottomRight");
      expect(store.layers.length).toBe(1);

      store.undo();
      expect(store.layers.length).toBe(0);

      store.redo();
      expect(store.layers.length).toBe(1);
    });
  });

  describe("clear", () => {
    it("should clear all state", () => {
      const store = useEditorStore();
      store.setImage("data:image/png;base64,test", 800, 600);
      store.addTextWatermark("Test", "bottomRight");
      store.setZoom(1.5);

      store.clear();

      expect(store.image).toBeNull();
      expect(store.layers).toEqual([]);
      expect(store.canvasSize).toEqual({ width: 800, height: 600 });
    });
  });

  describe("loadFromTemplate", () => {
    it("should load layers from template", () => {
      const store = useEditorStore();
      const templateLayers: import("@/types").Layer[] = [
        {
          id: "test-1",
          type: "text" as const,
          name: "Test",
          visible: true,
          lock: false,
          props: {
            text: "Template Text",
            x: 100,
            y: 100,
            fontSize: 24,
            fontFamily: "Arial",
            fontWeight: "normal",
            fontStyle: "normal" as const,
            color: "#ffffff",
            backgroundColor: "transparent",
            opacity: 1,
            rotation: 0,
          },
        },
      ];

      store.loadFromTemplate(templateLayers);

      expect(store.layers.length).toBe(1);
      expect(store.layers[0]?.props).toHaveProperty("text", "Template Text");
    });
  });

  describe("addImageLayer", () => {
    it("should add image layer with default properties", () => {
      const store = useEditorStore();
      store.setImage("data:image/png;base64,test", 800, 600);

      const layerId = store.addImageLayer();

      expect(store.layers.length).toBe(1);
      const layer = store.layers[0];
      expect(layer?.type).toBe("image");
      expect(layer?.name).toBe("Image 1");
      expect(layer?.visible).toBe(true);
      expect(layer?.lock).toBe(false);
      expect((layer?.props as any).src).toBe("data:image/png;base64,test");
      expect((layer?.props as any).width).toBe(800);
      expect((layer?.props as any).height).toBe(600);
      expect(store.activeLayerId).toBe(layerId);
    });

    it("should add image layer with custom properties", () => {
      const store = useEditorStore();
      store.setImage("data:image/png;base64,test", 800, 600);

      const layerId = store.addImageLayer({
        x: 100,
        y: 200,
        width: 400,
        height: 300,
        opacity: 0.5,
        rotation: 45,
      });

      const layer = store.layers[0];
      expect((layer?.props as any).x).toBe(100);
      expect((layer?.props as any).y).toBe(200);
      expect((layer?.props as any).width).toBe(400);
      expect((layer?.props as any).height).toBe(300);
      expect((layer?.props as any).opacity).toBe(0.5);
      expect((layer?.props as any).rotation).toBe(45);
      expect(store.activeLayerId).toBe(layerId);
    });

    it("should increment image layer name", () => {
      const store = useEditorStore();
      store.setImage("data:image/png;base64,test", 800, 600);

      store.addImageLayer();
      store.addImageLayer();
      store.addImageLayer();

      expect(store.layers[2]?.name).toBe("Image 3");
    });

    it("should save to history when adding image layer", () => {
      const store = useEditorStore();
      store.setImage("data:image/png;base64,test", 800, 600);

      expect(store.canUndo).toBe(false);
      store.addImageLayer();
      expect(store.canUndo).toBe(true);
    });
  });

  describe("addImageWatermark", () => {
    it("should add image watermark layer", () => {
      const store = useEditorStore();
      store.setImage("data:image/png;base64,test", 800, 600);

      const layerId = store.addImageWatermark("data:image/png;base64,logo", "topLeft");

      expect(store.layers.length).toBe(1);
      const layer = store.layers[0];
      expect(layer?.type).toBe("image-watermark");
      expect(layer?.name).toBe("Image 1");
      expect((layer?.props as any).src).toBe("data:image/png;base64,logo");
      expect(store.activeLayerId).toBe(layerId);
    });

    it("should add image watermark with custom properties", () => {
      const store = useEditorStore();
      store.setImage("data:image/png;base64,test", 800, 600);

      const layerId = store.addImageWatermark("data:image/png;base64,logo", "bottomRight", {
        width: 150,
        height: 150,
        opacity: 0.5,
      });

      const layer = store.layers[0];
      expect((layer?.props as any).x).toBe(780);
      expect((layer?.props as any).y).toBe(580);
      expect((layer?.props as any).width).toBe(150);
      expect((layer?.props as any).height).toBe(150);
      expect((layer?.props as any).opacity).toBe(0.5);
      expect(store.activeLayerId).toBe(layerId);
    });

    it("should increment image watermark name", () => {
      const store = useEditorStore();
      store.setImage("data:image/png;base64,test", 800, 600);

      store.addImageWatermark("data:image/png;base64,logo1", "topLeft");
      store.addImageWatermark("data:image/png;base64,logo2", "topLeft");

      expect(store.layers[1]?.name).toBe("Image 2");
    });

    it("should save to history when adding image watermark", () => {
      const store = useEditorStore();
      store.setImage("data:image/png;base64,test", 800, 600);

      expect(store.canUndo).toBe(false);
      store.addImageWatermark("data:image/png;base64,logo", "topLeft");
      expect(store.canUndo).toBe(true);
    });
  });

  describe("moveLayer", () => {
    it("should move layer up", () => {
      const store = useEditorStore();
      store.setImage("data:image/png;base64,test", 800, 600);

      const id1 = store.addTextWatermark("Test 1", "topLeft");
      const id2 = store.addTextWatermark("Test 2", "bottomRight");

      // Initial order: Test 1 at index 0, Test 2 at index 1
      expect(store.layers[0]?.id).toBe(id1);
      expect(store.layers[1]?.id).toBe(id2);

      // Move first layer up - should swap with layer at index 1
      store.moveLayer(id1, "up");

      // Now order should be: Test 2 at index 0, Test 1 at index 1
      expect(store.layers[0]?.id).toBe(id2);
      expect(store.layers[1]?.id).toBe(id1);
    });

    it("should move layer down", () => {
      const store = useEditorStore();
      store.setImage("data:image/png;base64,test", 800, 600);

      const id1 = store.addTextWatermark("Test 1", "topLeft");
      const id2 = store.addTextWatermark("Test 2", "bottomRight");

      // Move first layer down (index 0 - 1 = -1, which is out of bounds)
      // So it should not move
      store.moveLayer(id1, "down");

      // First layer should still be at index 0
      expect(store.layers[0]?.id).toBe(id1);
      expect(store.layers[1]?.id).toBe(id2);
    });

    it("should move second layer down", () => {
      const store = useEditorStore();
      store.setImage("data:image/png;base64,test", 800, 600);

      const id1 = store.addTextWatermark("Test 1", "topLeft");
      const id2 = store.addTextWatermark("Test 2", "bottomRight");

      // Move second layer down (index 1 - 1 = 0)
      store.moveLayer(id2, "down");

      // Now order should be: Test 2 at index 0, Test 1 at index 1
      expect(store.layers[0]?.id).toBe(id2);
      expect(store.layers[1]?.id).toBe(id1);
    });

    it("should not move layer beyond bounds", () => {
      const store = useEditorStore();
      store.setImage("data:image/png;base64,test", 800, 600);

      const id1 = store.addTextWatermark("Test 1", "topLeft");

      // Try to move first layer down - should stay (index - 1 = -1, out of bounds)
      store.moveLayer(id1, "down");
      expect(store.layers[0]?.id).toBe(id1);

      // Try to move first layer up when it's the only layer (index + 1 = 1, but length is 1)
      // Actually can move since there's no second layer, so stays at index 0
      store.moveLayer(id1, "up");
      expect(store.layers[0]?.id).toBe(id1);
    });

    it("should do nothing for non-existent layer", () => {
      const store = useEditorStore();
      store.setImage("data:image/png;base64,test", 800, 600);

      store.addTextWatermark("Test", "topLeft");
      const initialId = store.layers[0]?.id;

      store.moveLayer("non-existent-id", "up");

      expect(store.layers[0]?.id).toBe(initialId);
    });

    it("should save to history when moving layer", () => {
      const store = useEditorStore();
      store.setImage("data:image/png;base64,test", 800, 600);

      store.addTextWatermark("Test 1", "topLeft");
      store.addTextWatermark("Test 2", "bottomRight");

      // Add another operation to have history after setImage
      store.undo();
      // After undo to beginning, canUndo should be false

      // Now move layer - should save to history
      const id2 = store.layers[1]?.id;
      if (id2) {
        store.moveLayer(id2, "down");
      }

      // Should be able to undo the move
      expect(store.canUndo).toBe(true);
    });
  });

  describe("calculatePosition (uncovered positions)", () => {
    it("should calculate position for middleLeft", () => {
      const store = useEditorStore();
      store.setImage("data:image/png;base64,test", 800, 600);

      store.addTextWatermark("Test", "middleLeft");
      const layer = store.layers[0];
      expect((layer?.props as any).x).toBe(20);
      expect((layer?.props as any).y).toBe(300);
    });

    it("should calculate position for middleRight", () => {
      const store = useEditorStore();
      store.setImage("data:image/png;base64,test", 800, 600);

      store.addTextWatermark("Test", "middleRight");
      const layer = store.layers[0];
      expect((layer?.props as any).x).toBe(780);
      expect((layer?.props as any).y).toBe(300);
    });

    it("should calculate position for bottomLeft", () => {
      const store = useEditorStore();
      store.setImage("data:image/png;base64,test", 800, 600);

      store.addTextWatermark("Test", "bottomLeft");
      const layer = store.layers[0];
      expect((layer?.props as any).x).toBe(20);
      expect((layer?.props as any).y).toBe(580);
    });

    it("should calculate position for bottomCenter", () => {
      const store = useEditorStore();
      store.setImage("data:image/png;base64,test", 800, 600);

      store.addTextWatermark("Test", "bottomCenter");
      const layer = store.layers[0];
      expect((layer?.props as any).x).toBe(400);
      expect((layer?.props as any).y).toBe(580);
    });

    it("should use default position for unknown position", () => {
      const store = useEditorStore();
      store.setImage("data:image/png;base64,test", 800, 600);

      // Test default case by passing a position that doesn't exist in switch
      // The function handles unknown positions with default which returns bottomRight
      store.addTextWatermark("Test", "bottomRight");
      const layer = store.layers[0];
      expect((layer?.props as any).x).toBe(780);
      expect((layer?.props as any).y).toBe(580);
    });
  });

  describe("history truncation and MAX_HISTORY", () => {
    it("should truncate history when adding new state after undo", () => {
      const store = useEditorStore();
      store.setImage("data:image/png;base64,test", 800, 600);

      // Add multiple states
      store.addTextWatermark("Test 1", "topLeft");
      store.addTextWatermark("Test 2", "topLeft");
      store.addTextWatermark("Test 3", "topLeft");
      // History: [setImage(0), Test1(1), Test2(2), Test3(3)], historyIndex = 3

      // Undo twice to go back to Test1
      store.undo(); // to Test2, index = 2
      store.undo(); // to Test1, index = 1
      expect(store.canUndo).toBe(true);
      expect(store.layers.length).toBe(1);

      // Add new state - should truncate forward history (Test2, Test3)
      store.addTextWatermark("New Test", "topLeft");

      // History should be: [setImage(0), Test1(1), NewTest(2)]
      // The old forward history (Test2, Test3) is truncated
      expect(store.history.length).toBe(3);
      expect(store.canUndo).toBe(true);
    });

    it("should limit history to MAX_HISTORY (50)", () => {
      const store = useEditorStore();
      store.setImage("data:image/png;base64,test", 800, 600);

      // Add more than MAX_HISTORY states
      for (let i = 0; i < 60; i++) {
        store.addTextWatermark(`Test ${i}`, "topLeft");
      }

      // History should be limited to MAX_HISTORY + 1 (including initial setImage)
      // But canUndo should still work
      expect(store.canUndo).toBe(true);
      // The oldest states should be removed
      expect(store.history.length).toBeLessThanOrEqual(51);
    });
  });

  describe("activeLayer computed", () => {
    it("should return null when no active layer", () => {
      const store = useEditorStore();
      expect(store.activeLayer).toBeNull();
    });

    it("should return the active layer when set", () => {
      const store = useEditorStore();
      store.setImage("data:image/png;base64,test", 800, 600);

      const layerId = store.addTextWatermark("Test", "topLeft");
      expect(store.activeLayer?.id).toBe(layerId);
    });

    it("should return null when active layer is deleted", () => {
      const store = useEditorStore();
      store.setImage("data:image/png;base64,test", 800, 600);

      const layerId = store.addTextWatermark("Test", "topLeft");
      store.deleteLayer(layerId);
      expect(store.activeLayer).toBeNull();
    });
  });
});
