import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "./admin";

export const Route = createFileRoute("/admin/inventory")({
  head: () => ({ meta: [{ title: "Inventory — NovaShop Admin" }] }),
  component: () => <AdminPage initialSection="inventory" />,
});
