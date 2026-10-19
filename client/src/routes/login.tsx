import { createFileRoute } from "@tanstack/react-router";
import { CustomerAuthPage } from "@/components/shop/customer-auth-page";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    returnTo:
      search.returnTo === "/support" ? ("/support" as const) : ("/" as const),
  }),
  head: () => ({ meta: [{ title: "Sign In — NovaShop" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { returnTo } = Route.useSearch();
  return <CustomerAuthPage mode="login" returnTo={returnTo} />;
}
