import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "./admin";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({ meta: [{ title: "Order Management — NovaShop Admin" }] }),
  component: () => <AdminPage initialSection="orders" />,
});
