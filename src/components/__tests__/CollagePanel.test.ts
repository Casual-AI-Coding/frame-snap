import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import CollagePanel from "../Collage/CollagePanel.vue";

describe("CollagePanel.vue", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("renders collage panel", () => {
    const wrapper = mount(CollagePanel);

    expect(wrapper.find(".collage-panel").exists()).toBe(true);
  });

  it("has layout options", () => {
    const wrapper = mount(CollagePanel);

    const layoutButtons = wrapper.findAll(".layout-btn");
    expect(layoutButtons.length).toBe(3);
  });

  it("has grid controls", () => {
    const wrapper = mount(CollagePanel);

    // Check for input elements
    const inputs = wrapper.findAll("input");
    expect(inputs.length).toBeGreaterThan(0);
  });

  it("has gap control", () => {
    const wrapper = mount(CollagePanel);

    const sliders = wrapper.findAll('input[type="range"]');
    expect(sliders.length).toBeGreaterThan(0);
  });
});
