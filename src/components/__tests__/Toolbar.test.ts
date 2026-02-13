import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import Toolbar from "../Editor/Toolbar.vue";

describe("Toolbar.vue", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("renders toolbar with zoom controls", () => {
    const wrapper = mount(Toolbar);

    expect(wrapper.find(".toolbar").exists()).toBe(true);
    expect(wrapper.find(".zoom-label").exists()).toBe(true);
    expect(wrapper.find(".zoom-slider").exists()).toBe(true);
  });

  it("displays canvas size", () => {
    const wrapper = mount(Toolbar);

    expect(wrapper.find(".canvas-size").text()).toContain("800 × 600");
  });

  it("has undo/redo buttons", () => {
    const wrapper = mount(Toolbar);

    const buttons = wrapper.findAll("button");
    expect(buttons.length).toBe(2);
  });

  it("displays zoom percentage", () => {
    const wrapper = mount(Toolbar);

    expect(wrapper.find(".zoom-label").text()).toContain("100%");
  });
});
