import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import HomeView from "../HomeView.vue";

// Mock global objects
const mockRouterPush = vi.fn();
const mockSetImage = vi.fn();

vi.mock("vue-router", async () => {
  const actual = await vi.importActual("vue-router");
  return {
    ...actual,
    useRouter: () => ({
      push: mockRouterPush,
    }),
  };
});

vi.mock("@/stores", () => ({
  useEditorStore: () => ({
    setImage: mockSetImage,
  }),
}));

describe("HomeView.vue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
  });

  it("renders home page with logo", () => {
    const wrapper = mount(HomeView);

    expect(wrapper.find(".home").exists()).toBe(true);
    expect(wrapper.find(".logo-text").text()).toBe("FrameSnap");
  });

  it("renders title and subtitle", () => {
    const wrapper = mount(HomeView);

    expect(wrapper.find(".title").text()).toContain("照片水印");
    expect(wrapper.find(".subtitle").text()).toContain("简单");
  });

  it("has upload button", () => {
    const wrapper = mount(HomeView);

    expect(wrapper.find(".upload-button").exists()).toBe(true);
    expect(wrapper.find('input[type="file"]').exists()).toBe(true);
  });

  it("has quick action buttons", () => {
    const wrapper = mount(HomeView);

    const buttons = wrapper.findAll(".action-button");
    expect(buttons.length).toBe(2);
    expect(buttons[0]!.find(".action-text").text()).toBe("编辑器");
    expect(buttons[1]!.find(".action-text").text()).toBe("模板库");
  });

  it("has logo icon and subtitle", () => {
    const wrapper = mount(HomeView);

    expect(wrapper.find(".logo-icon").exists()).toBe(true);
    expect(wrapper.find(".logo-sub").text()).toBe("帧像");
  });

  it("calls router.push when clicking editor button", async () => {
    const wrapper = mount(HomeView);

    await wrapper.findAll(".action-button")[0]!.trigger("click");

    expect(mockRouterPush).toHaveBeenCalledWith("/editor");
  });

  it("calls router.push when clicking templates button", async () => {
    const wrapper = mount(HomeView);

    await wrapper.findAll(".action-button")[1]!.trigger("click");

    expect(mockRouterPush).toHaveBeenCalledWith("/templates");
  });

  it("handles file upload when file is selected", async () => {
    const wrapper = mount(HomeView);

    const file = new File(["test"], "test.png", { type: "image/png" });
    const input = wrapper.find('input[type="file"]');

    Object.defineProperty(input.element, "files", {
      value: [file],
      writable: false,
    });

    await input.trigger("change");
  });

  it("handles empty file selection", async () => {
    const wrapper = mount(HomeView);

    const input = wrapper.find('input[type="file"]');

    Object.defineProperty(input.element, "files", {
      value: [],
      writable: false,
    });

    await input.trigger("change");

    expect(mockRouterPush).not.toHaveBeenCalled();
  });
});
