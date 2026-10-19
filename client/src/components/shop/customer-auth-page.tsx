import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { CircleAlert, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api";
import { useShop } from "./shop-context";

type AdminUser = { id: string; name: string; email: string };
const adminTokenKey = "novashop-admin-token";

export function CustomerAuthPage({
  mode,
  onAdminAuthenticated,
  onCustomerAuthenticated,
  returnTo = "/",
}: {
  mode: "login" | "register";
  onAdminAuthenticated?: (admin: AdminUser) => void;
  onCustomerAuthenticated?: () => void;
  returnTo?: "/" | "/support";
}) {
  const isRegistration = mode === "register";
  const navigate = useNavigate();
  const { logout, register, setCustomerSession } = useShop();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (isRegistration) {
        await register({ name, email, password });
        if (returnTo !== "/") {
          await navigate({ to: returnTo });
          return;
        }
      } else {
        const result = await apiRequest<
          | { role: "admin"; token: string; admin: AdminUser }
          | { token: string; admin: AdminUser }
          | {
              role: "customer";
              token: string;
              user: { id: string; name: string; email: string };
            }
        >("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        if ("admin" in result) {
          logout();
          window.localStorage.setItem(adminTokenKey, result.token);
          if (onAdminAuthenticated) onAdminAuthenticated(result.admin);
          else await navigate({ to: "/admin" });
          return;
        }
        if (!("user" in result) || !result.user) {
          throw new Error("The server returned an invalid sign-in response.");
        }
        setCustomerSession(result.token, result.user);
        if (onCustomerAuthenticated) {
          onCustomerAuthenticated();
          return;
        }
        if (returnTo !== "/") {
          await navigate({ to: returnTo });
          return;
        }
      }
      setComplete(true);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "We could not sign you in. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto grid min-h-[70vh] max-w-md place-items-center">
      <section className="w-full space-y-5 rounded-3xl bg-card p-7 shadow-soft sm:p-9">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-accent text-primary">
          <ShoppingBag />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            {isRegistration ? "NovaShop account" : "NovaShop"}
          </p>
          <h1 className="mt-2 text-2xl font-bold">
            {complete
              ? "You’re signed in"
              : isRegistration
                ? "Create your account"
                : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {complete
              ? isRegistration
                ? "Your account is ready. You can continue shopping."
                : "You are signed in and can continue shopping."
              : isRegistration
                ? "Join NovaShop to keep track of your orders."
                : "Sign in to continue to your account or store dashboard."}
          </p>
        </div>
        {complete ? (
          <Button asChild className="w-full rounded-xl">
            <Link to="/">Continue shopping</Link>
          </Button>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            {error && (
              <p
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"
              >
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </p>
            )}
            {isRegistration && (
              <label className="block space-y-2 text-sm font-medium">
                Full name
                <Input
                  required
                  autoComplete="name"
                  maxLength={120}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </label>
            )}
            <label className="block space-y-2 text-sm font-medium">
              Email address
              <Input
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label className="block space-y-2 text-sm font-medium">
              Password
              <Input
                required
                type="password"
                autoComplete={
                  isRegistration ? "new-password" : "current-password"
                }
                minLength={isRegistration ? 8 : 1}
                maxLength={isRegistration ? 128 : undefined}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <span className="block text-xs font-normal text-muted-foreground">
                {isRegistration ? "Use at least 8 characters." : ""}
              </span>
            </label>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl"
            >
              {submitting
                ? "Please wait…"
                : isRegistration
                  ? "Create account"
                  : "Sign in"}
            </Button>
          </form>
        )}
        {!complete && (
          <p className="text-center text-sm text-muted-foreground">
            {isRegistration ? "Already have an account? " : "New to NovaShop? "}
            <Link
              to={isRegistration ? "/login" : "/register"}
              search={{ returnTo }}
              className="font-semibold text-primary hover:underline"
            >
              {isRegistration ? "Sign in" : "Create an account"}
            </Link>
          </p>
        )}
      </section>
    </main>
  );
}
