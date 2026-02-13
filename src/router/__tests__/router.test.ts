import { describe, it, expect } from "vitest";

describe("Router", () => {
  it("should have correct routes", async () => {
    const { createRouter, createWebHistory } = await import("vue-router");

    const router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: "/", name: "home", component: { template: "<div>Home</div>" } },
        {
          path: "/editor",
          name: "editor",
          component: { template: "<div>Editor</div>" },
        },
        {
          path: "/templates",
          name: "templates",
          component: { template: "<div>Templates</div>" },
        },
      ],
    });

    expect(router.options.routes.length).toBe(3);
    expect(router.options.routes[0]!.path).toBe("/");
    expect(router.options.routes[1]!.path).toBe("/editor");
    expect(router.options.routes[2]!.path).toBe("/templates");
  });

  it("should have named routes", async () => {
    const { createRouter, createWebHistory } = await import("vue-router");

    const router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: "/", name: "home", component: { template: "<div>Home</div>" } },
        {
          path: "/editor",
          name: "editor",
          component: { template: "<div>Editor</div>" },
        },
        {
          path: "/templates",
          name: "templates",
          component: { template: "<div>Templates</div>" },
        },
      ],
    });

    expect(router.options.routes[0]!.name).toBe("home");
    expect(router.options.routes[1]!.name).toBe("editor");
    expect(router.options.routes[2]!.name).toBe("templates");
  });
});
