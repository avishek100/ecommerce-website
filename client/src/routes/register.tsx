import { createFileRoute } from "@tanstack/react-router";
import { CustomerAuthPage } from "@/components/shop/customer-auth-page";

export const Route = createFileRoute("/register")({
  validateSearch: (search: Record<string, unknown>) => ({
    returnTo:
      search.returnTo === "/support" ? ("/support" as const) : ("/" as const),
  }),
  head: () => ({ meta: [{ title: "Create Account — NovaShop" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const { returnTo } = Route.useSearch();
  return <CustomerAuthPage mode="register" returnTo={returnTo} />;
}
