import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import HelloWorld from "../HelloWorld.vue";

describe("HelloWorld.vue", () => {
  it("renders properly with message", () => {
    const wrapper = mount(HelloWorld, {
      props: { msg: "Hello World" },
    });

    expect(wrapper.text()).toContain("Hello World");
  });

  it("increments count on button click", async () => {
    const wrapper = mount(HelloWorld, {
      props: { msg: "Test" },
    });

    const button = wrapper.find("button");
    expect(button.exists()).toBe(true);

    await button.trigger("click");
    expect(button.text()).toContain("count is 1");
  });
});
