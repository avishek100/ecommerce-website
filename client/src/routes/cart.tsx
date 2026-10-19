import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Lock, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShop } from "@/components/shop/shop-context";
import { apiRequest, productImage } from "@/lib/api";
import { formatPrice } from "@/components/shop/shop-data";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your Cart — NovaShop" }] }),
  component: CartPage,
});

const provinces = [
  "Koshi",
  "Madhesh",
  "Bagmati",
  "Gandaki",
  "Lumbini",
  "Karnali",
  "Sudurpashchim",
];

function CartPage() {
  const {
    cart,
    setCart,
    qty,
    remove,
    products,
    add,
    user,
    authToken,
    authLoading,
  } = useShop();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutName, setCheckoutName] = useState(user?.name ?? "");
  const [checkoutEmail, setCheckoutEmail] = useState(user?.email ?? "");
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [checkoutAddress, setCheckoutAddress] = useState("");
  const [checkoutCity, setCheckoutCity] = useState("");
  const [checkoutProvince, setCheckoutProvince] = useState("");
  const [checkoutPostalCode, setCheckoutPostalCode] = useState("");
  const [orderError, setOrderError] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.qty,
    0,
  );

  useEffect(() => {
    if (!user) return;
    setCheckoutName(user.name);
    setCheckoutEmail(user.email);
  }, [user]);

  async function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOrderError("");
    try {
      if (cart.some((item) => !item._id))
        throw new Error(
          "Your cart has an item that is not available. Refresh the store and try again.",
        );
      await apiRequest(
        "/orders",
        {
          method: "POST",
          body: JSON.stringify({
            customer: {
              name: checkoutName,
              email: checkoutEmail,
              phone: checkoutPhone,
              address: checkoutAddress,
              city: checkoutCity,
              province: checkoutProvince,
              postalCode: checkoutPostalCode,
            },
            items: cart.map((item) => ({
              productId: item._id,
              quantity: item.qty,
            })),
          }),
        },
        authToken || undefined,
      );
      setCart([]);
      setCheckoutOpen(false);
      setOrderPlaced(true);
    } catch (error) {
      setOrderError(
        error instanceof Error ? error.message : "Could not place your order.",
      );
    }
  }

  return (
    <main className="mx-auto max-w-4xl space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-card p-5 shadow-soft">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            NovaShop
          </p>
          <h1 className="mt-1 text-2xl font-bold">Your cart</h1>
        </div>
        <Button asChild variant="outline" className="rounded-xl">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue shopping
          </Link>
        </Button>
      </header>

      {orderPlaced && (
        <p
          role="status"
          className="rounded-2xl bg-success/10 p-4 text-sm text-success"
        >
          Thank you! Your order was placed successfully.
        </p>
      )}

      {!cart.length ? (
        <section className="space-y-3 rounded-3xl bg-card p-8 text-center shadow-soft">
          <h2 className="text-lg font-semibold">
            {orderPlaced ? "Your order is confirmed" : "Your cart is empty"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {orderPlaced
              ? "You can continue browsing the store."
              : "Add a few items to your cart and they will show up here."}
          </p>
          <Button asChild className="rounded-xl">
            <Link to="/">Browse products</Link>
          </Button>
        </section>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-3xl bg-card p-5 shadow-soft">
            <h2 className="mb-2 font-bold">Items ({cart.length})</h2>
            <div className="divide-y">
              {cart.map((item) => (
                <article
                  key={item._id ?? item.name}
                  className="flex gap-3 py-4"
                >
                  <img
                    src={productImage(item.img)}
                    alt={item.name}
                    className="h-20 w-20 rounded-xl bg-muted object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.size}</p>
                    <p className="mt-1 text-sm font-bold">
                      {formatPrice(item.price)}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <Button
                        variant="ghost"
                        aria-label={`Decrease quantity of ${item.name}`}
                        onClick={() => qty(item._id ?? item.name, -1)}
                        className="grid h-7 w-7 place-items-center rounded-full border"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span aria-label="Quantity">{item.qty}</span>
                      <Button
                        variant="ghost"
                        aria-label={`Increase quantity of ${item.name}`}
                        onClick={() => qty(item._id ?? item.name, 1)}
                        className="grid h-7 w-7 place-items-center rounded-full border"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        aria-label={`Remove ${item.name} from cart`}
                        onClick={() => remove(item._id ?? item.name)}
                        className="ml-auto text-muted-foreground"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className="h-fit rounded-3xl bg-card p-5 shadow-soft">
            <h2 className="mb-4 font-bold">Order summary</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd className="text-sale">Free</dd>
              </div>
              <div className="flex justify-between border-t pt-3 text-base font-bold">
                <dt>Total</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
            </dl>
            <Button
              disabled={authLoading}
              onClick={() => {
                setCheckoutOpen((open) => !open);
                setOrderError("");
              }}
              className="mt-5 w-full rounded-xl"
            >
              <Lock className="mr-2 h-4 w-4" />
              {authLoading ? "Loading account…" : "Continue to checkout"}
            </Button>
            {checkoutOpen && (
              <form
                onSubmit={placeOrder}
                className="mt-4 space-y-3 border-t pt-4"
              >
                <h3 className="text-sm font-bold">Delivery details</h3>
                {orderError && (
                  <p role="alert" className="text-xs text-destructive">
                    {orderError}
                  </p>
                )}
                <input
                  required
                  autoComplete="name"
                  value={checkoutName}
                  onChange={(event) => setCheckoutName(event.target.value)}
                  placeholder="Full name"
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm"
                />
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={checkoutEmail}
                  onChange={(event) => setCheckoutEmail(event.target.value)}
                  placeholder="Email address"
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm"
                />
                <input
                  required
                  type="tel"
                  autoComplete="tel"
                  minLength={7}
                  maxLength={20}
                  pattern="[+0-9() -]{7,20}"
                  value={checkoutPhone}
                  onChange={(event) => setCheckoutPhone(event.target.value)}
                  placeholder="Phone number"
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm"
                />
                <textarea
                  required
                  minLength={5}
                  autoComplete="street-address"
                  value={checkoutAddress}
                  onChange={(event) => setCheckoutAddress(event.target.value)}
                  placeholder="Delivery address"
                  className="min-h-20 w-full rounded-xl border bg-background px-3 py-2 text-sm"
                />
                <input
                  required
                  autoComplete="address-level2"
                  value={checkoutCity}
                  onChange={(event) => setCheckoutCity(event.target.value)}
                  placeholder="City or municipality"
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm"
                />
                <select
                  required
                  autoComplete="address-level1"
                  value={checkoutProvince}
                  onChange={(event) => setCheckoutProvince(event.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select province</option>
                  {provinces.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
                <input
                  autoComplete="postal-code"
                  maxLength={20}
                  value={checkoutPostalCode}
                  onChange={(event) =>
                    setCheckoutPostalCode(event.target.value)
                  }
                  placeholder="Postal code (optional)"
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm"
                />
                <Button type="submit" className="w-full rounded-xl">
                  Place order · {formatPrice(subtotal)}
                </Button>
              </form>
            )}
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              We accept VISA · Mastercard · PayPal · Apple Pay · G Pay
            </p>
          </aside>
        </div>
      )}

      {products.length > 0 && (
        <section className="rounded-3xl bg-card p-5 shadow-soft">
          <h2 className="mb-3 font-bold">You might also like</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {products.slice(0, 2).map((product) => (
              <article
                key={product._id ?? product.name}
                className="flex items-center gap-3 rounded-2xl bg-background p-3"
              >
                <img
                  src={productImage(product.img)}
                  alt={product.name}
                  className="h-16 w-16 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{product.name}</p>
                  <p className="text-sm font-bold">
                    {formatPrice(product.price)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => add(product)}
                  className="rounded-xl"
                >
                  Add
                </Button>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
