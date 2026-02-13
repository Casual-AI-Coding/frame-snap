import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { v4 as uuidv4 } from "uuid";
import type { Template, TemplateCategory, Layer, CanvasSize } from "@/types";

const BUILT_IN_TEMPLATES: Template[] = [
  {
    id: "builtin-1",
    name: "简约白边",
    nameEn: "Simple White Border",
    category: "frame",
    thumbnail: "",
    config: {
      layers: [
        {
          id: "frame-1",
          type: "frame",
          name: "白边框",
          visible: true,
          lock: false,
          props: {
            frameType: "border",
            borderWidth: 20,
            borderColor: "#ffffff",
            borderStyle: "solid",
            blurRadius: 0,
            filterType: "grayscale",
            filterIntensity: 0,
          },
        },
      ],
      canvas: {
        width: 800,
        height: 600,
        backgroundColor: "#ffffff",
      },
    },
    createdAt: Date.now(),
    isBuiltIn: true,
  },
  {
    id: "builtin-2",
    name: "右下角水印",
    nameEn: "Bottom Right Watermark",
    category: "watermark",
    thumbnail: "",
    config: {
      layers: [
        {
          id: "text-1",
          type: "text",
          name: "水印文字",
          visible: true,
          lock: false,
          props: {
            text: "© FrameSnap",
            x: 780,
            y: 580,
            fontSize: 18,
            fontFamily: "Arial",
            fontWeight: "normal",
            fontStyle: "normal",
            color: "#ffffff",
            backgroundColor: "transparent",
            opacity: 0.7,
            rotation: 0,
          },
        },
      ],
      canvas: {
        width: 800,
        height: 600,
        backgroundColor: "transparent",
      },
    },
    createdAt: Date.now(),
    isBuiltIn: true,
  },
  {
    id: "builtin-3",
    name: "复古胶片",
    nameEn: "Vintage Film",
    category: "frame",
    thumbnail: "",
    config: {
      layers: [
        {
          id: "frame-1",
          type: "frame",
          name: "边框",
          visible: true,
          lock: false,
          props: {
            frameType: "border",
            borderWidth: 15,
            borderColor: "#2d2d2d",
            borderStyle: "solid",
            blurRadius: 0,
            filterType: "sepia",
            filterIntensity: 30,
          },
        },
      ],
      canvas: {
        width: 800,
        height: 600,
        backgroundColor: "#f5f5dc",
      },
    },
    createdAt: Date.now(),
    isBuiltIn: true,
  },
  {
    id: "builtin-4",
    name: "二宫格",
    nameEn: "2-Grid Collage",
    category: "collage",
    thumbnail: "",
    config: {
      layers: [
        {
          id: "collage-1",
          type: "collage",
          name: "拼图",
          visible: true,
          lock: false,
          props: {
            layout: "grid",
            columns: 2,
            rows: 1,
            gap: 5,
            images: [],
          },
        },
      ],
      canvas: {
        width: 800,
        height: 400,
        backgroundColor: "#ffffff",
      },
    },
    createdAt: Date.now(),
    isBuiltIn: true,
  },
];

export const useTemplateStore = defineStore("template", () => {
  // State
  const builtInTemplates = ref<Template[]>(BUILT_IN_TEMPLATES);
  const customTemplates = ref<Template[]>([]);

  // Getters
  const allTemplates = computed(() => [
    ...builtInTemplates.value,
    ...customTemplates.value,
  ]);

  const templatesByCategory = computed(() => {
    return (category: TemplateCategory) =>
      allTemplates.value.filter((t) => t.category === category);
  });

  // Actions
  function getTemplateById(id: string): Template | undefined {
    return allTemplates.value.find((t) => t.id === id);
  }

  function saveAsTemplate(
    name: string,
    nameEn: string,
    category: TemplateCategory,
    layers: Layer[],
    canvasSize: CanvasSize,
    backgroundColor: string,
    thumbnail: string = "",
  ): Template {
    const template: Template = {
      id: uuidv4(),
      name,
      nameEn,
      category,
      thumbnail,
      config: {
        layers,
        canvas: {
          width: canvasSize.width,
          height: canvasSize.height,
          backgroundColor,
        },
      },
      createdAt: Date.now(),
      isBuiltIn: false,
    };
    customTemplates.value.push(template);
    saveToLocalStorage();
    return template;
  }

  function deleteTemplate(id: string) {
    const index = customTemplates.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      customTemplates.value.splice(index, 1);
      saveToLocalStorage();
    }
  }

  function exportTemplate(id: string): string {
    const template = getTemplateById(id);
    if (!template) return "";
    return JSON.stringify(template, null, 2);
  }

  function importTemplate(jsonString: string): Template | null {
    try {
      const data = JSON.parse(jsonString) as Template;
      // Validate required fields
      if (!data.name || !data.category || !data.config) {
        throw new Error("Invalid template format");
      }
      // Assign new ID to avoid conflicts
      data.id = uuidv4();
      data.isBuiltIn = false;
      data.createdAt = Date.now();
      customTemplates.value.push(data);
      saveToLocalStorage();
      return data;
    } catch {
      return null;
    }
  }

  function saveToLocalStorage() {
    try {
      localStorage.setItem(
        "framesnap-custom-templates",
        JSON.stringify(customTemplates.value),
      );
    } catch {
      console.error("Failed to save templates to localStorage");
    }
  }

  function loadFromLocalStorage() {
    try {
      const data = localStorage.getItem("framesnap-custom-templates");
      if (data) {
        customTemplates.value = JSON.parse(data);
      }
    } catch {
      console.error("Failed to load templates from localStorage");
    }
  }

  // Initialize
  loadFromLocalStorage();

  return {
    // State
    builtInTemplates,
    customTemplates,

    // Getters
    allTemplates,
    templatesByCategory,

    // Actions
    getTemplateById,
    saveAsTemplate,
    deleteTemplate,
    exportTemplate,
    importTemplate,
    loadFromLocalStorage,
  };
});
