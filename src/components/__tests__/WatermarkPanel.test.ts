import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import WatermarkPanel from "../Watermark/WatermarkPanel.vue";

describe("WatermarkPanel.vue", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("renders watermark panel", () => {
    const wrapper = mount(WatermarkPanel);

    expect(wrapper.find(".watermark-panel").exists()).toBe(true);
    expect(wrapper.find(".panel-title").text()).toBe("文字水印");
  });

  it("shows disabled button when no image", () => {
    const wrapper = mount(WatermarkPanel);

    const button = wrapper.find(".add-button");
    expect(button.exists()).toBe(true);
    expect(button.attributes("disabled")).toBeDefined();
  });

  it("has form inputs", () => {
    const wrapper = mount(WatermarkPanel);

    expect(wrapper.find('input[type="text"]').exists()).toBe(true);
    expect(wrapper.find('input[type="color"]').exists()).toBe(true);
    // Now has 4 range inputs: fontSize, opacity (text), watermarkSize, opacity (image)
    expect(wrapper.findAll('input[type="range"]').length).toBe(4);
  });

  it("has position grid with 9 positions (2 sets)", () => {
    const wrapper = mount(WatermarkPanel);

    const positionButtons = wrapper.findAll(".position-btn");
    // 9 positions for text + 9 positions for image = 18
    expect(positionButtons.length).toBe(18);
  });
});
