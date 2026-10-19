import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  ShoppingBag,
  Home,
  LayoutGrid,
  Tag,
  Sparkles,
  ThumbsUp,
  Gem,
  BookOpen,
  ClipboardList,
  Heart,
  Ticket,
  MapPin,
  Settings,
  Headphones,
  ChevronRight,
  Menu,
  X,
  Search,
  ShoppingCart,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShop } from "./shop-context";

const shoppingNav = [
  { icon: Home, title: "Home", to: "/" },
  { icon: LayoutGrid, title: "Categories", to: "/categories" },
  { icon: Tag, title: "Deals", to: "/deals" },
  { icon: Sparkles, title: "New Arrivals", to: "/new-arrivals" },
  { icon: ThumbsUp, title: "Best Sellers", to: "/best-sellers" },
  { icon: Gem, title: "Brands", to: "/brands" },
  { icon: BookOpen, title: "Collections", to: "/collections" },
  { icon: MessageCircle, title: "Chat with Support", to: "/support" },
] as const;
const accountNav = [
  { icon: ClipboardList, title: "My Orders", to: "/my-orders" },
  { icon: Heart, title: "Wishlist", to: "/wishlist" },
  { icon: Ticket, title: "Coupons", to: "/coupons" },
  { icon: MapPin, title: "Addresses", to: "/addresses" },
  { icon: Settings, title: "Account Settings", to: "/account-settings" },
] as const;
export function ShopShell({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState(false);
  const { cart, wish, search, setSearch, profile, user, authLoading, logout } =
    useShop();
  const cartCount = cart.reduce((count, item) => count + item.qty, 0);
  useEffect(() => {
    if (!menu) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", close);
    };
  }, [menu]);
  return (
    <div className="min-h-screen bg-background p-3 font-sans text-foreground sm:p-4">
      <div className="mx-auto grid max-w-[1440px] items-start gap-4 md:grid-cols-[200px_minmax(0,1fr)]">
        {menu && (
          <div
            onClick={() => setMenu(false)}
            className="fixed inset-0 z-40 bg-foreground/40 md:hidden"
            aria-hidden="true"
          />
        )}
        <aside
          aria-label="Main menu"
          className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col overflow-y-auto bg-card p-4 shadow-soft transition-transform md:sticky md:top-4 md:max-h-[calc(100dvh-2rem)] md:w-auto md:translate-x-0 md:rounded-3xl ${menu ? "translate-x-0" : "-translate-x-full"}`}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMenu(false)}
            aria-label="Close menu"
            className="absolute right-2 top-3 md:hidden"
          >
            <X />
          </Button>
          <Link
            to="/"
            onClick={() => setMenu(false)}
            className="mb-6 flex items-center gap-2 px-2 text-lg font-bold"
          >
            <ShoppingBag className="h-6 w-6 text-primary" />
            NovaShop
          </Link>
          {[shoppingNav, accountNav].map((group, index) => (
            <nav
              key={index}
              aria-label={index ? "Your account" : "Shop"}
              className={index ? "mt-3 space-y-1 border-t pt-3" : "space-y-1"}
            >
              {group.map(({ icon: Icon, title, to }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => {
                    setMenu(false);
                    setSearch("");
                  }}
                  activeOptions={{ exact: true }}
                  activeProps={{
                    className:
                      "bg-primary font-semibold text-primary-foreground",
                  }}
                  inactiveProps={{
                    className: "text-foreground/80 hover:bg-accent",
                  }}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{title}</span>
                  {title === "Deals" && (
                    <span className="ml-auto rounded-full bg-sale px-2 text-[10px] font-semibold text-primary-foreground">
                      Hot
                    </span>
                  )}
                  {title === "Wishlist" && wish.length > 0 && (
                    <span className="ml-auto text-xs">{wish.length}</span>
                  )}
                </Link>
              ))}
            </nav>
          ))}
          <nav
            aria-label="Store administration"
            className="mt-3 space-y-1 border-t pt-3"
          >
            <Link
              to="/admin"
              onClick={() => setMenu(false)}
              activeOptions={{ exact: true }}
              activeProps={{
                className: "bg-primary font-semibold text-primary-foreground",
              }}
              inactiveProps={{
                className: "text-foreground/80 hover:bg-accent",
              }}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm"
            >
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>Admin dashboard</span>
            </Link>
          </nav>
          <div className="mt-4 rounded-2xl bg-promo p-4 text-primary-foreground">
            <p className="text-xs opacity-90">Special Offer</p>
            <p className="mt-1 text-xl font-bold">Summer Sale</p>
            <p className="text-sm">Up to 50% Off</p>
            <Button
              asChild
              variant="secondary"
              size="sm"
              className="mt-3 rounded-full bg-card text-primary"
            >
              <Link to="/deals" onClick={() => setMenu(false)}>
                Shop Now <ChevronRight />
              </Link>
            </Button>
            <ShoppingBag className="ml-auto mt-3 h-12 w-12 opacity-80" />
          </div>
          <div className="mt-6 flex items-center gap-3 px-2 pb-2 text-sm">
            <Headphones className="h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">Need Help?</p>
              <p className="text-xs text-muted-foreground">Support Center</p>
            </div>
          </div>
        </aside>
        <div className="min-w-0 space-y-4">
          <header className="flex min-w-0 items-center gap-2 sm:gap-4">
            <Button
              onClick={() => setMenu(true)}
              aria-label="Open menu"
              variant="secondary"
              size="icon"
              className="h-11 w-11 shrink-0 rounded-full bg-card shadow-soft md:hidden"
            >
              <Menu />
            </Button>
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-card px-4 py-3 shadow-soft">
              <input
                aria-label="Search products"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              {search ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  <X />
                </Button>
              ) : (
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
            </div>
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="relative shrink-0 rounded-full"
              title="Wishlist"
            >
              <Link to="/wishlist" aria-label="View wishlist">
                <Heart />
                {wish.length > 0 && (
                  <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
                    {wish.length}
                  </span>
                )}
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="relative shrink-0 rounded-full"
              title="Cart"
            >
              <Link
                to="/cart"
                aria-label={`View cart${cartCount ? `, ${cartCount} ${cartCount === 1 ? "item" : "items"}` : ""}`}
              >
                <ShoppingCart />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
                    {cartCount}
                  </span>
                )}
              </Link>
            </Button>
            {authLoading ? (
              <span
                aria-label="Loading account"
                className="h-9 w-16 shrink-0 animate-pulse rounded-full bg-muted"
              />
            ) : user ? (
              <div className="flex shrink-0 items-center gap-2 text-sm">
                <Link
                  to="/account-settings"
                  className="flex items-center gap-2"
                  aria-label="Account settings"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-xs font-bold text-primary">
                    {profile.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <span className="hidden max-w-28 truncate lg:block">
                    {profile.name}
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="hidden px-2 text-xs sm:inline-flex"
                >
                  Sign out
                </Button>
              </div>
            ) : (
              <Link
                to="/login"
                className="shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                Sign in
              </Link>
            )}
          </header>
          {children}
          <footer className="flex flex-wrap items-center justify-between gap-2 border-t px-1 py-5 text-xs text-muted-foreground">
            <span>© 2026 NovaShop</span>
            <span className="flex items-center gap-1">
              <ShoppingBag className="h-3 w-3" />
              Find your everyday favorites
            </span>
          </footer>
        </div>
      </div>
    </div>
  );
}
