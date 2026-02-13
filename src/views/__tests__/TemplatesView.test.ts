import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import { createPinia, setActivePinia } from "pinia";
import TemplatesView from "../TemplatesView.vue";

// Create mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: { template: "<div>Home</div>" } },
    { path: "/editor", component: { template: "<div>Editor</div>" } },
    { path: "/templates", component: TemplatesView },
  ],
});

// Stub alert
window.alert = vi.fn();

describe("TemplatesView.vue", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("renders templates view", () => {
    const wrapper = mount(TemplatesView, {
      global: {
        plugins: [router],
      },
    });

    expect(wrapper.find(".templates").exists()).toBe(true);
  });

  it("has tabs", () => {
    const wrapper = mount(TemplatesView, {
      global: {
        plugins: [router],
      },
    });

    const tabs = wrapper.findAll(".tab");
    expect(tabs.length).toBe(3);
  });

  it("displays template cards", () => {
    const wrapper = mount(TemplatesView, {
      global: {
        plugins: [router],
      },
    });

    const cards = wrapper.findAll(".template-card");
    expect(cards.length).toBeGreaterThan(0);
  });

  it("has add button", () => {
    const wrapper = mount(TemplatesView, {
      global: {
        plugins: [router],
      },
    });

    const buttons = wrapper.findAll("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("switches to frame tab", async () => {
    const wrapper = mount(TemplatesView, {
      global: {
        plugins: [router],
      },
    });

    await wrapper.findAll(".tab")[1]!.trigger("click");

    const tabs = wrapper.findAll(".tab");
    expect(tabs[1]!.classes()).toContain("active");
  });

  it("switches to collage tab", async () => {
    const wrapper = mount(TemplatesView, {
      global: {
        plugins: [router],
      },
    });

    await wrapper.findAll(".tab")[2]!.trigger("click");

    const tabs = wrapper.findAll(".tab");
    expect(tabs[2]!.classes()).toContain("active");
  });

  it("has import button", () => {
    const wrapper = mount(TemplatesView, {
      global: {
        plugins: [router],
      },
    });

    expect(wrapper.find(".import-button").exists()).toBe(true);
  });
});
