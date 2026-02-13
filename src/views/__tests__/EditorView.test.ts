import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import { createPinia, setActivePinia } from "pinia";
import EditorView from "../EditorView.vue";

// Create mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: { template: "<div>Home</div>" } },
    { path: "/editor", component: EditorView },
  ],
});

describe("EditorView.vue", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("renders editor view", () => {
    const wrapper = mount(EditorView, {
      global: {
        plugins: [router],
      },
    });

    expect(wrapper.find(".editor").exists()).toBe(true);
  });

  it("has back button", () => {
    const wrapper = mount(EditorView, {
      global: {
        plugins: [router],
      },
    });

    expect(wrapper.find(".back-button").exists()).toBe(true);
  });

  it("has three tabs", () => {
    const wrapper = mount(EditorView, {
      global: {
        plugins: [router],
      },
    });

    const tabs = wrapper.findAll(".tab");
    expect(tabs.length).toBe(3);
    expect(tabs[0]!.text()).toBe("水印");
    expect(tabs[1]!.text()).toBe("相框");
    expect(tabs[2]!.text()).toBe("拼图");
  });

  it("switches tabs", async () => {
    const wrapper = mount(EditorView, {
      global: {
        plugins: [router],
      },
    });

    // Click on frame tab
    await wrapper.findAll(".tab")[1]!.trigger("click");

    expect(wrapper.findAll(".tab")[1]!.classes()).toContain("active");
  });

  it("has export button", () => {
    const wrapper = mount(EditorView, {
      global: {
        plugins: [router],
      },
    });

    expect(wrapper.find(".export-button").exists()).toBe(true);
    expect(wrapper.find(".export-button").text()).toBe("导出");
  });
});
