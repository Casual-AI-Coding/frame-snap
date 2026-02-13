import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useSettingsStore } from "../settings";

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

describe("SettingsStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
  });

  describe("initial state", () => {
    it("should have default settings", () => {
      const store = useSettingsStore();

      expect(store.settings.theme).toBe("dark");
      expect(store.settings.language).toBe("zh");
      expect(store.settings.defaultExportFormat).toBe("png");
      expect(store.settings.defaultExportQuality).toBe(0.92);
      expect(store.settings.showGridLines).toBe(false);
      expect(store.settings.autoSave).toBe(false);
    });
  });

  describe("setTheme", () => {
    it("should change theme", () => {
      const store = useSettingsStore();

      store.setTheme("light");
      expect(store.settings.theme).toBe("light");

      store.setTheme("dark");
      expect(store.settings.theme).toBe("dark");
    });
  });

  describe("setLanguage", () => {
    it("should change language", () => {
      const store = useSettingsStore();

      store.setLanguage("en");
      expect(store.settings.language).toBe("en");

      store.setLanguage("zh");
      expect(store.settings.language).toBe("zh");
    });
  });

  describe("updateSettings", () => {
    it("should update multiple settings at once", () => {
      const store = useSettingsStore();

      store.updateSettings({
        theme: "light",
        language: "en",
        defaultExportFormat: "jpeg",
      });

      expect(store.settings.theme).toBe("light");
      expect(store.settings.language).toBe("en");
      expect(store.settings.defaultExportFormat).toBe("jpeg");
      // Other settings should remain unchanged
      expect(store.settings.defaultExportQuality).toBe(0.92);
    });
  });

  describe("resetSettings", () => {
    it("should reset to default settings", () => {
      const store = useSettingsStore();

      // Change some settings
      store.updateSettings({
        theme: "light",
        language: "en",
        defaultExportFormat: "jpeg",
      });

      // Reset
      store.resetSettings();

      // Should be back to defaults
      expect(store.settings.theme).toBe("dark");
      expect(store.settings.language).toBe("zh");
      expect(store.settings.defaultExportFormat).toBe("png");
    });
  });

  describe("localStorage", () => {
    it("should save settings to localStorage", () => {
      const store = useSettingsStore();

      store.setTheme("light");

      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it("should load settings from localStorage", () => {
      // Set up mock to return stored settings
      const storedSettings = {
        theme: "light",
        language: "en",
        defaultExportFormat: "jpeg",
        defaultExportQuality: 0.8,
        showGridLines: true,
        autoSave: true,
      };
      (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValueOnce(
        JSON.stringify(storedSettings),
      );

      setActivePinia(createPinia());
      const store = useSettingsStore();

      expect(store.settings.theme).toBe("light");
      expect(store.settings.language).toBe("en");
      expect(store.settings.defaultExportFormat).toBe("jpeg");
      expect(store.settings.defaultExportQuality).toBe(0.8);
      expect(store.settings.showGridLines).toBe(true);
      expect(store.settings.autoSave).toBe(true);
    });

    it("should handle invalid JSON in localStorage", () => {
      // Set up mock to return invalid JSON
      (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValueOnce(
        "invalid-json-{",
      );

      // Spy on console.error
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      setActivePinia(createPinia());
      const store = useSettingsStore();

      // Should fall back to defaults
      expect(store.settings.theme).toBe("dark");
      expect(store.settings.language).toBe("zh");
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to load settings from localStorage",
      );

      consoleSpy.mockRestore();
    });

    it("should handle localStorage getItem returning null", () => {
      // Set up mock to return null (no stored settings)
      (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValueOnce(
        null,
      );

      setActivePinia(createPinia());
      const store = useSettingsStore();

      // Should use defaults
      expect(store.settings.theme).toBe("dark");
      expect(store.settings.language).toBe("zh");
    });

    it("should handle localStorage quota exceeded", () => {
      const store = useSettingsStore();

      // Mock setItem to throwQuotaExceededError
      (localStorage.setItem as ReturnType<typeof vi.fn>).mockImplementationOnce(
        () => {
          const error = new Error("QuotaExceededError") as any;
          error.name = "QuotaExceededError";
          throw error;
        },
      );

      // Spy on console.error
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // This should not throw but log error
      store.setTheme("light");

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to save settings to localStorage",
      );

      consoleSpy.mockRestore();
    });

    it("should handle localStorage disabled", () => {
      // Mock getItem to throw error (localStorage disabled)
      (localStorage.getItem as ReturnType<typeof vi.fn>).mockImplementationOnce(
        () => {
          throw new Error("localStorage is not available");
        },
      );

      // Spy on console.error
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      setActivePinia(createPinia());
      const store = useSettingsStore();

      // Should fall back to defaults
      expect(store.settings.theme).toBe("dark");
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
