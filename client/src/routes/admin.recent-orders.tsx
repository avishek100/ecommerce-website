import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "./admin";

export const Route = createFileRoute("/admin/recent-orders")({
  head: () => ({ meta: [{ title: "Recent Orders — NovaShop Admin" }] }),
  component: () => <AdminPage initialSection="recent-orders" />,
});
