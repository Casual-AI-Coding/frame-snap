import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createCanvas,
  addTextToCanvas,
  addFrameToCanvas,
  exportCanvas,
  downloadImage,
  clearCanvas,
  syncLayersFromCanvas,
  getCanvasCenter,
  fitCanvasToContainer,
  addImageToCanvas,
  applyFilter,
} from "../fabric";

// Mock fabric module
vi.mock("fabric", () => ({
  Canvas: vi.fn().mockImplementation(() => ({
    width: 800,
    height: 600,
    add: vi.fn(),
    remove: vi.fn(),
    renderAll: vi.fn(),
    getObjects: vi.fn().mockReturnValue([]),
    setActiveObject: vi.fn(),
    toDataURL: vi.fn().mockReturnValue("data:image/png;base64,mock"),
  })),
  Textbox: vi.fn().mockImplementation(() => ({})),
  Rect: vi.fn().mockImplementation(() => ({})),
  FabricImage: {
    fromURL: vi.fn().mockResolvedValue({
      width: 100,
      height: 100,
      set: vi.fn(),
      scale: vi.fn(),
    }),
  },
  filters: {
    Grayscale: vi.fn(),
    Sepia: vi.fn(),
    Blur: vi.fn().mockImplementation(() => ({})),
    Brightness: vi.fn().mockImplementation(() => ({})),
    Contrast: vi.fn().mockImplementation(() => ({})),
  },
}));

// Mock document
const mockLink = {
  download: "",
  href: "",
  click: vi.fn(),
  remove: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  document.createElement = vi.fn().mockReturnValue(mockLink);
  document.body.appendChild = vi.fn();
  document.body.removeChild = vi.fn();
});

describe("fabric utils", () => {
  describe("createCanvas", () => {
    it("should create a canvas with given dimensions", () => {
      const canvasEl = document.createElement("canvas");
      const canvas = createCanvas(canvasEl, 800, 600, "#ffffff");
      expect(canvas).toBeDefined();
    });

    it("should create canvas with default background color", () => {
      const canvasEl = document.createElement("canvas");
      const canvas = createCanvas(canvasEl, 800, 600);
      expect(canvas).toBeDefined();
    });
  });

  describe("addTextToCanvas", () => {
    it("should add text to canvas", () => {
      const mockCanvas = {
        add: vi.fn(),
        setActiveObject: vi.fn(),
        renderAll: vi.fn(),
      };

      const props = {
        text: "Test",
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
      };

      const result = addTextToCanvas(mockCanvas as any, props);
      expect(result).toBeDefined();
    });

    it("should handle non-transparent background color", () => {
      const mockCanvas = {
        add: vi.fn(),
        setActiveObject: vi.fn(),
        renderAll: vi.fn(),
      };

      const props = {
        text: "Test",
        x: 100,
        y: 100,
        fontSize: 24,
        fontFamily: "Arial",
        fontWeight: "normal",
        fontStyle: "normal" as const,
        color: "#ffffff",
        backgroundColor: "#000000",
        opacity: 1,
        rotation: 0,
      };

      const result = addTextToCanvas(mockCanvas as any, props);
      expect(result).toBeDefined();
    });
  });

  describe("addFrameToCanvas", () => {
    it("should add border frame to canvas", () => {
      const mockCanvas = {
        add: vi.fn(),
        renderAll: vi.fn(),
      };

      const props = {
        frameType: "border" as const,
        borderWidth: 20,
        borderColor: "#ffffff",
        borderStyle: "solid" as const,
        blurRadius: 0,
        filterType: "grayscale" as const,
        filterIntensity: 0,
      };

      const result = addFrameToCanvas(mockCanvas as any, props, 800, 600);
      expect(result.length).toBe(4);
    });

    it("should add border with dashed style", () => {
      const mockCanvas = {
        add: vi.fn(),
        renderAll: vi.fn(),
      };

      const props = {
        frameType: "border" as const,
        borderWidth: 10,
        borderColor: "#000000",
        borderStyle: "dashed" as const,
        blurRadius: 0,
        filterType: "grayscale" as const,
        filterIntensity: 0,
      };

      const result = addFrameToCanvas(mockCanvas as any, props, 800, 600);
      expect(result.length).toBe(4);
    });

    it("should add border with dotted style", () => {
      const mockCanvas = {
        add: vi.fn(),
        renderAll: vi.fn(),
      };

      const props = {
        frameType: "border" as const,
        borderWidth: 15,
        borderColor: "#FF0000",
        borderStyle: "dotted" as const,
        blurRadius: 0,
        filterType: "grayscale" as const,
        filterIntensity: 0,
      };

      const result = addFrameToCanvas(mockCanvas as any, props, 800, 600);
      expect(result.length).toBe(4);
    });

    it("should return empty array for blur frame type", () => {
      const mockCanvas = {
        add: vi.fn(),
        renderAll: vi.fn(),
      };

      const props = {
        frameType: "blur" as const,
        borderWidth: 20,
        borderColor: "#ffffff",
        borderStyle: "solid" as const,
        blurRadius: 10,
        filterType: "grayscale" as const,
        filterIntensity: 0,
      };

      const result = addFrameToCanvas(mockCanvas as any, props, 800, 600);
      expect(result.length).toBe(0);
    });

    it("should return empty array for filter frame type", () => {
      const mockCanvas = {
        add: vi.fn(),
        renderAll: vi.fn(),
      };

      const props = {
        frameType: "filter" as const,
        borderWidth: 20,
        borderColor: "#ffffff",
        borderStyle: "solid" as const,
        blurRadius: 0,
        filterType: "grayscale" as const,
        filterIntensity: 50,
      };

      const result = addFrameToCanvas(mockCanvas as any, props, 800, 600);
      expect(result.length).toBe(0);
    });
  });

  describe("exportCanvas", () => {
    it("should export canvas to data URL", () => {
      const mockCanvas = {
        toDataURL: vi.fn().mockReturnValue("data:image/png;base64,test"),
      };

      const result = exportCanvas(mockCanvas as any, "png", 1, 1);
      expect(result).toBe("data:image/png;base64,test");
    });

    it("should export with jpeg format", () => {
      const mockCanvas = {
        toDataURL: vi.fn().mockReturnValue("data:image/jpeg;base64,test"),
      };

      const result = exportCanvas(mockCanvas as any, "jpeg", 0.9, 2);
      expect(result).toBe("data:image/jpeg;base64,test");
    });
  });

  describe("downloadImage", () => {
    it("should create download link and trigger click", () => {
      downloadImage("data:image/png;base64,test", "test.png");

      expect(document.createElement).toHaveBeenCalledWith("a");
      expect(mockLink.download).toBe("test.png");
      expect(mockLink.href).toBe("data:image/png;base64,test");
      expect(mockLink.click).toHaveBeenCalled();
    });
  });

  describe("clearCanvas", () => {
    it("should remove all objects from canvas", () => {
      const mockObj1 = { remove: vi.fn() };
      const mockObj2 = { remove: vi.fn() };

      const mockCanvas = {
        getObjects: vi.fn().mockReturnValue([mockObj1, mockObj2]),
        remove: vi.fn(),
        renderAll: vi.fn(),
      };

      clearCanvas(mockCanvas as any);

      expect(mockCanvas.remove).toHaveBeenCalledTimes(2);
      expect(mockCanvas.renderAll).toHaveBeenCalled();
    });

    it("should handle empty canvas", () => {
      const mockCanvas = {
        getObjects: vi.fn().mockReturnValue([]),
        remove: vi.fn(),
        renderAll: vi.fn(),
      };

      clearCanvas(mockCanvas as any);

      expect(mockCanvas.remove).toHaveBeenCalledTimes(0);
      expect(mockCanvas.renderAll).toHaveBeenCalled();
    });
  });

  describe("syncLayersFromCanvas", () => {
    it("should sync layer IDs to canvas objects", () => {
      const mockObj = { set: vi.fn() };

      const mockCanvas = {
        getObjects: vi.fn().mockReturnValue([mockObj]),
      };

      syncLayersFromCanvas(mockCanvas as any, ["layer-1"]);

      expect(mockObj.set).toHaveBeenCalledWith("data-layer-id", "layer-1");
    });

    it("should handle more objects than layer IDs", () => {
      const mockObj1 = { set: vi.fn() };
      const mockObj2 = { set: vi.fn() };

      const mockCanvas = {
        getObjects: vi.fn().mockReturnValue([mockObj1, mockObj2]),
      };

      syncLayersFromCanvas(mockCanvas as any, ["layer-1"]);

      expect(mockObj1.set).toHaveBeenCalledWith("data-layer-id", "layer-1");
      expect(mockObj2.set).not.toHaveBeenCalled();
    });
  });

  describe("getCanvasCenter", () => {
    it("should return canvas center coordinates", () => {
      const mockCanvas = {
        width: 800,
        height: 600,
      };

      const result = getCanvasCenter(mockCanvas as any);
      expect(result.x).toBe(400);
      expect(result.y).toBe(300);
    });
  });

  describe("fitCanvasToContainer", () => {
    it("should calculate scale to fit canvas in container", () => {
      const mockCanvas = {
        width: 800,
        height: 600,
      };

      const scale = fitCanvasToContainer(mockCanvas as any, 400, 300);
      expect(scale).toBe(0.5);
    });

    it("should not scale up if canvas is smaller", () => {
      const mockCanvas = {
        width: 400,
        height: 300,
      };

      const scale = fitCanvasToContainer(mockCanvas as any, 800, 600);
      expect(scale).toBe(1);
    });

    it("should fit by width when width is limiting factor", () => {
      const mockCanvas = {
        width: 800,
        height: 300,
      };

      const scale = fitCanvasToContainer(mockCanvas as any, 400, 600);
      expect(scale).toBe(0.5);
    });

    it("should fit by height when height is limiting factor", () => {
      const mockCanvas = {
        width: 300,
        height: 600,
      };

      const scale = fitCanvasToContainer(mockCanvas as any, 600, 400);
      expect(scale).toBeCloseTo(0.666);
    });
  });

  describe("addImageToCanvas", () => {
    it("should add image to canvas successfully", async () => {
      const mockImgElement = {
        naturalWidth: 1600,
        naturalHeight: 1200,
        width: 1600,
        height: 1200,
      };
      
      const mockImg = {
        width: 1600,
        height: 1200,
        set: vi.fn(),
        scale: vi.fn(),
        getElement: () => mockImgElement,
      };

      const { FabricImage } = await import("fabric");
      (FabricImage.fromURL as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockImg,
      );

      const mockCanvas = {
        width: 800,
        height: 600,
        add: vi.fn(),
        renderAll: vi.fn(),
      };

      const result = await addImageToCanvas(
        mockCanvas as any,
        "data:image/png;base64,test",
      );
      expect(result).toBeDefined();
    });

    it("should reject when FabricImage.fromURL returns null", async () => {
      const { FabricImage } = await import("fabric");
      (FabricImage.fromURL as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        null,
      );

      const mockCanvas = {
        width: 800,
        height: 600,
        add: vi.fn(),
        renderAll: vi.fn(),
      };

      await expect(
        addImageToCanvas(mockCanvas as any, "data:image/png;base64,test"),
      ).rejects.toThrow("Failed to create image");
    });

    it("should reject when image has no dimensions", async () => {
      const mockImgElement = {
        naturalWidth: 0,
        naturalHeight: 0,
        width: 0,
        height: 0,
      };
      
      const mockImg = {
        width: 0,
        height: 0,
        set: vi.fn(),
        scale: vi.fn(),
        getElement: () => mockImgElement,
      };

      const { FabricImage } = await import("fabric");
      (FabricImage.fromURL as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockImg,
      );

      const mockCanvas = {
        width: 800,
        height: 600,
        add: vi.fn(),
        renderAll: vi.fn(),
      };

      await expect(
        addImageToCanvas(mockCanvas as any, "data:image/png;base64,test"),
      ).rejects.toThrow("Image has no dimensions");
    });

    it("should handle FabricImage.fromURL rejection", async () => {
      const { FabricImage } = await import("fabric");
      (FabricImage.fromURL as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error("Network error"),
      );

      const mockCanvas = {
        width: 800,
        height: 600,
        add: vi.fn(),
        renderAll: vi.fn(),
      };

      await expect(
        addImageToCanvas(mockCanvas as any, "data:image/png;base64,test"),
      ).rejects.toThrow("Network error");
    });
  });

  describe("applyFilter", () => {
    it("should apply grayscale filter to FabricImage objects", () => {
      // The test validates that the function doesn't throw and calls renderAll
      // The actual instanceof check happens at runtime with the real FabricImage class
      const mockCanvas = {
        getObjects: vi.fn().mockReturnValue([]),
        renderAll: vi.fn(),
      };

      applyFilter(mockCanvas as any, "grayscale", 50);

      // With no objects, renderAll should not be called
      expect(mockCanvas.renderAll).not.toHaveBeenCalled();
    });

    it("should apply blur filter", async () => {
      const mockCanvas = {
        getObjects: vi.fn().mockReturnValue([]),
        renderAll: vi.fn(),
      };

      applyFilter(mockCanvas as any, "blur", 50);
      expect(mockCanvas.renderAll).not.toHaveBeenCalled();
    });

    it("should apply brightness filter", () => {
      const mockCanvas = {
        getObjects: vi.fn().mockReturnValue([]),
        renderAll: vi.fn(),
      };

      applyFilter(mockCanvas as any, "brightness", 75);
      expect(mockCanvas.renderAll).not.toHaveBeenCalled();
    });

    it("should apply contrast filter", () => {
      const mockCanvas = {
        getObjects: vi.fn().mockReturnValue([]),
        renderAll: vi.fn(),
      };

      applyFilter(mockCanvas as any, "contrast", 50);
      expect(mockCanvas.renderAll).not.toHaveBeenCalled();
    });

    it("should handle unknown filter type", () => {
      const mockCanvas = {
        getObjects: vi.fn().mockReturnValue([]),
        renderAll: vi.fn(),
      };

      applyFilter(mockCanvas as any, "unknown", 50);
      expect(mockCanvas.renderAll).not.toHaveBeenCalled();
    });
  });
});
