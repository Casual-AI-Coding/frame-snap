import { defineStore } from "pinia";
import { ref } from "vue";

export type Theme = "dark" | "light";
export type Language = "zh" | "en";

export interface AppSettings {
  theme: Theme;
  language: Language;
  defaultExportFormat: "png" | "jpeg";
  defaultExportQuality: number;
  showGridLines: boolean;
  autoSave: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: "dark",
  language: "zh",
  defaultExportFormat: "png",
  defaultExportQuality: 0.92,
  showGridLines: false,
  autoSave: false,
};

export const useSettingsStore = defineStore("settings", () => {
  // State
  const settings = ref<AppSettings>({ ...DEFAULT_SETTINGS });

  // Load from localStorage
  function loadFromLocalStorage() {
    try {
      const data = localStorage.getItem("framesnap-settings");
      if (data) {
        const parsed = JSON.parse(data);
        settings.value = { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch {
      console.error("Failed to load settings from localStorage");
    }
    applyTheme();
  }

  // Save to localStorage
  function saveToLocalStorage() {
    try {
      localStorage.setItem(
        "framesnap-settings",
        JSON.stringify(settings.value),
      );
    } catch {
      console.error("Failed to save settings to localStorage");
    }
  }

  // Apply theme to document
  function applyTheme() {
    document.documentElement.setAttribute("data-theme", settings.value.theme);
  }

  // Actions
  function setTheme(theme: Theme) {
    settings.value.theme = theme;
    applyTheme();
    saveToLocalStorage();
  }

  function setLanguage(language: Language) {
    settings.value.language = language;
    saveToLocalStorage();
  }

  function updateSettings(updates: Partial<AppSettings>) {
    settings.value = { ...settings.value, ...updates };
    applyTheme();
    saveToLocalStorage();
  }

  function resetSettings() {
    settings.value = { ...DEFAULT_SETTINGS };
    applyTheme();
    saveToLocalStorage();
  }

  // Initialize
  loadFromLocalStorage();

  return {
    settings,
    setTheme,
    setLanguage,
    updateSettings,
    resetSettings,
    loadFromLocalStorage,
  };
});
