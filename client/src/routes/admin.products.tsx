import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "./admin";

export const Route = createFileRoute("/admin/products")({
  head: () => ({ meta: [{ title: "Product Management — NovaShop Admin" }] }),
  component: () => <AdminPage initialSection="products" />,
});
