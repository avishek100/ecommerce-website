import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "./admin";

export const Route = createFileRoute("/admin/chat")({
  head: () => ({ meta: [{ title: "Customer Chat — NovaShop Admin" }] }),
  component: () => <AdminPage initialSection="chat" />,
});
