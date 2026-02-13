import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useTemplateStore } from "../template";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(global, "localStorage", { value: localStorageMock });

describe("TemplateStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
  });

  describe("initial state", () => {
    it("should have built-in templates", () => {
      const store = useTemplateStore();

      expect(store.builtInTemplates.length).toBeGreaterThan(0);
      expect(store.customTemplates).toEqual([]);
    });

    it("should combine built-in and custom templates", () => {
      const store = useTemplateStore();

      expect(store.allTemplates.length).toBe(store.builtInTemplates.length);
    });
  });

  describe("getTemplateById", () => {
    it("should find built-in template by id", () => {
      const store = useTemplateStore();
      const builtIn = store.builtInTemplates[0]!;

      const found = store.getTemplateById(builtIn.id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(builtIn.id);
    });

    it("should return undefined for non-existent id", () => {
      const store = useTemplateStore();

      const found = store.getTemplateById("non-existent");
      expect(found).toBeUndefined();
    });
  });

  describe("saveAsTemplate", () => {
    it("should save custom template", () => {
      const store = useTemplateStore();
      const initialCount = store.customTemplates.length;

      const template = store.saveAsTemplate(
        "My Template",
        "My Template EN",
        "watermark",
        [],
        { width: 800, height: 600 },
        "#ffffff",
      );

      expect(store.customTemplates.length).toBe(initialCount + 1);
      expect(template.name).toBe("My Template");
      expect(template.isBuiltIn).toBe(false);
    });
  });

  describe("deleteTemplate", () => {
    it("should delete custom template", () => {
      const store = useTemplateStore();
      // Clear any existing custom templates first
      store.customTemplates = [];

      const template = store.saveAsTemplate(
        "To Delete",
        "To Delete EN",
        "watermark",
        [],
        { width: 800, height: 600 },
        "#ffffff",
      );
      expect(store.customTemplates.length).toBe(1);

      store.deleteTemplate(template.id);
      expect(store.customTemplates.length).toBe(0);
    });

    it("should not delete built-in templates", () => {
      const store = useTemplateStore();
      const builtIn = store.builtInTemplates[0]!;

      store.deleteTemplate(builtIn.id);
      expect(store.builtInTemplates.length).toBeGreaterThan(0);
    });
  });

  describe("exportTemplate", () => {
    it("should export template as JSON", () => {
      const store = useTemplateStore();
      const template = store.builtInTemplates[0]!;

      const json = store.exportTemplate(template.id);

      expect(json).toBeTruthy();
      const parsed = JSON.parse(json);
      expect(parsed.id).toBe(template.id);
      expect(parsed.name).toBe(template.name);
    });

    it("should return empty string for non-existent template", () => {
      const store = useTemplateStore();

      const json = store.exportTemplate("non-existent");
      expect(json).toBe("");
    });
  });

  describe("importTemplate", () => {
    it("should import valid template", () => {
      const store = useTemplateStore();
      const initialCount = store.customTemplates.length;

      const templateData = {
        name: "Imported Template",
        nameEn: "Imported EN",
        category: "frame",
        config: {
          layers: [],
          canvas: { width: 800, height: 600, backgroundColor: "#fff" },
        },
      };

      const imported = store.importTemplate(JSON.stringify(templateData));

      expect(imported).toBeDefined();
      expect(imported?.name).toBe("Imported Template");
      expect(store.customTemplates.length).toBe(initialCount + 1);
    });

    it("should return null for invalid JSON", () => {
      const store = useTemplateStore();

      const imported = store.importTemplate("invalid json");
      expect(imported).toBeNull();
    });

    it("should return null for missing required fields", () => {
      const store = useTemplateStore();

      const imported = store.importTemplate(
        JSON.stringify({ name: "Only Name" }),
      );
      expect(imported).toBeNull();
    });
  });

  describe("templatesByCategory", () => {
    it("should filter templates by category", () => {
      const store = useTemplateStore();

      const watermarkTemplates = store.templatesByCategory("watermark");
      expect(watermarkTemplates.every((t) => t.category === "watermark")).toBe(
        true,
      );

      const frameTemplates = store.templatesByCategory("frame");
      expect(frameTemplates.every((t) => t.category === "frame")).toBe(true);
    });
  });
});
