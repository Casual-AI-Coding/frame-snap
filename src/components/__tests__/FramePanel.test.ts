import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import FramePanel from "../Frame/FramePanel.vue";

describe("FramePanel.vue", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("renders frame panel", () => {
    const wrapper = mount(FramePanel);

    expect(wrapper.find(".frame-panel").exists()).toBe(true);
    expect(wrapper.find(".panel-title").text()).toBe("相框");
  });

  it("has type tabs", () => {
    const wrapper = mount(FramePanel);

    const tabs = wrapper.findAll(".type-tab");
    expect(tabs.length).toBe(3);
  });

  it("has type tabs and switches", async () => {
    const wrapper = mount(FramePanel);

    const tabs = wrapper.findAll(".type-tab");
    expect(tabs.length).toBe(3);

    // Click on border tab
    await tabs[0]!.trigger("click");
    expect(tabs[0]!.classes()).toContain("active");
  });
});
