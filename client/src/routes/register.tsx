import { createFileRoute } from "@tanstack/react-router";
import { CustomerAuthPage } from "@/components/shop/customer-auth-page";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create Account — NovaShop" }] }),
  component: () => <CustomerAuthPage mode="register" />,
});
