import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it.each([
    "admin",
    "admin/recent-orders",
    "admin/products",
    "admin/inventory",
    "admin/orders",
    "login",
    "register",
    "categories",
    "deals",
    "new-arrivals",
    "best-sellers",
    "brands",
    "collections",
    "my-orders",
    "wishlist",
    "coupons",
    "addresses",
    "account-settings",
    "cart",
    "support",
    "admin/chat",
  ])("opens the separate %s page", (page) => {
    const router = createRouter({
      routeTree,
      context: { queryClient: new QueryClient() },
    });
    const expectedRouteId = page === "admin" ? "/admin/" : `/${page}`;
    expect(router.matchRoutes(`/${page}`).at(-1)?.routeId).toBe(
      expectedRouteId,
    );
  });
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({
      routeTree,
      context: { queryClient: new QueryClient() },
    });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });
});
