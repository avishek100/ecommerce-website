import { createFileRoute } from "@tanstack/react-router";
import { CustomerAuthPage } from "@/components/shop/customer-auth-page";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign In — NovaShop" }] }),
  component: () => <CustomerAuthPage mode="login" />,
});
