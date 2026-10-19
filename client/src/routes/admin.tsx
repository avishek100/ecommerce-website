import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  CircleAlert,
  Clock3,
  Eye,
  EyeOff,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  MessageCircle,
  Package,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomerAuthPage } from "@/components/shop/customer-auth-page";
import { ApiError, apiRequest, productImage } from "@/lib/api";
import type { Product } from "@/components/shop/shop-data";
import { formatPrice } from "@/components/shop/shop-data";
import { AdminChat } from "@/components/admin/admin-chat";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard — NovaShop" }] }),
  component: () => <Outlet />,
});

type AdminUser = { id: string; name: string; email: string };
type OrderItem = { name: string; img: string; price: number; quantity: number };
export type AdminSection =
  "overview" | "recent-orders" | "products" | "inventory" | "orders" | "chat";
type Order = {
  _id: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
    address: string;
    city?: string;
    province?: string;
    postalCode?: string;
  };
  items: OrderItem[];
  total: number;
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled";
  createdAt: string;
};
type Dashboard = {
  metrics: {
    productCount: number;
    activeProducts: number;
    orderCount: number;
    revenue: number;
    pendingOrders: number;
  };
  recentOrders: Order[];
};
type ProductDraft = Omit<Product, "_id" | "old"> & {
  old: number | undefined;
  stock: number;
  isActive: boolean;
};

const emptyDraft: ProductDraft = {
  name: "",
  sub: "",
  price: 0,
  old: undefined,
  img: "",
  off: 0,
  rating: 0,
  reviews: 0,
  category: "Fashion",
  brand: "",
  isNew: false,
  stock: 0,
  isActive: true,
};

const sections = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, to: "/admin" },
  {
    id: "recent-orders",
    label: "Recent orders",
    icon: Clock3,
    to: "/admin/recent-orders",
  },
  {
    id: "products",
    label: "Product management",
    icon: Package,
    to: "/admin/products",
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: Boxes,
    to: "/admin/inventory",
  },
  {
    id: "orders",
    label: "Order management",
    icon: ShoppingCart,
    to: "/admin/orders",
  },
  {
    id: "chat",
    label: "Customer chat",
    icon: MessageCircle,
    to: "/admin/chat",
  },
] as const;

export function AdminPage({
  initialSection = "overview",
}: {
  initialSection?: AdminSection;
}) {
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [authReady, setAuthReady] = useState(false);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [section, setSection] = useState<AdminSection>(initialSection);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState("All");
  const [draft, setDraft] = useState<ProductDraft | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [stockValues, setStockValues] = useState<Record<string, number>>({});
  const [savingStockId, setSavingStockId] = useState<string | null>(null);

  useEffect(() => {
    setStockValues(
      Object.fromEntries(
        products
          .filter((product) => product._id)
          .map((product) => [product._id!, product.stock ?? 0]),
      ),
    );
  }, [products]);

  useEffect(() => {
    setSection(initialSection);
    if (initialSection !== "products") {
      setDraft(null);
      setEditingId(null);
      setSelectedImage(null);
    }
  }, [initialSection]);

  useEffect(() => {
    setToken(window.localStorage.getItem("novashop-admin-token") ?? "");
    setAuthReady(true);
  }, []);

  useEffect(() => {
    if (!authReady || !token) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      apiRequest<{ admin: AdminUser }>("/admin/session", {}, token),
      apiRequest<Dashboard>("/admin/dashboard", {}, token),
      apiRequest<{ products: Product[] }>(
        "/admin/products?includeArchived=true",
        {},
        token,
      ),
      apiRequest<{ orders: Order[] }>("/admin/orders", {}, token),
    ])
      .then(([session, summary, productData, orderData]) => {
        if (cancelled) return;
        setAdmin(session.admin);
        setDashboard(summary);
        setProducts(productData.products);
        setOrders(orderData.orders);
        setError("");
      })
      .catch((requestError: unknown) => {
        if (cancelled) return;
        if (requestError instanceof ApiError && requestError.status === 401) {
          window.localStorage.removeItem("novashop-admin-token");
          setToken("");
          setAdmin(null);
        }
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Could not load admin data.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authReady, token]);

  async function refreshAdminData(activeToken = token) {
    const [summary, productData, orderData] = await Promise.all([
      apiRequest<Dashboard>("/admin/dashboard", {}, activeToken),
      apiRequest<{ products: Product[] }>(
        "/admin/products?includeArchived=true",
        {},
        activeToken,
      ),
      apiRequest<{ orders: Order[] }>("/admin/orders", {}, activeToken),
    ]);
    setDashboard(summary);
    setProducts(productData.products);
    setOrders(orderData.orders);
  }

  function signOut() {
    window.localStorage.removeItem("novashop-admin-token");
    setToken("");
    setAdmin(null);
    setDashboard(null);
    setProducts([]);
    setOrders([]);
    setError("");
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    setSaving(true);
    setError("");
    try {
      let productDraft = draft;
      if (selectedImage) {
        const formData = new FormData();
        formData.append("image", selectedImage);
        const uploaded = await apiRequest<{ image: string }>(
          "/admin/products/images",
          { method: "POST", body: formData },
          token,
        );
        productDraft = { ...draft, img: uploaded.image };
      }
      const path = editingId
        ? `/admin/products/${editingId}`
        : "/admin/products";
      const saved = await apiRequest<{ product: Product }>(
        path,
        {
          method: editingId ? "PATCH" : "POST",
          body: JSON.stringify(productDraft),
        },
        token,
      );
      setProducts((current) =>
        editingId
          ? current.map((product) =>
              product._id === editingId ? saved.product : product,
            )
          : [saved.product, ...current],
      );
      await refreshAdminData();
      setDraft(null);
      setEditingId(null);
      setSelectedImage(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not save this product.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveStock(product: Product) {
    if (!product._id) return;
    setSavingStockId(product._id);
    setError("");
    try {
      const result = await apiRequest<{ product: Product }>(
        `/admin/products/${product._id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            ...product,
            stock: stockValues[product._id] ?? 0,
          }),
        },
        token,
      );
      setProducts((current) =>
        current.map((item) =>
          item._id === product._id ? result.product : item,
        ),
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not update inventory.",
      );
    } finally {
      setSavingStockId(null);
    }
  }

  async function archiveProduct(product: Product) {
    if (
      !product._id ||
      !window.confirm(
        `${product.isActive ? "Archive" : "Restore"} "${product.name}"?`,
      )
    )
      return;
    setError("");
    try {
      if (product.isActive) {
        await apiRequest(
          `/admin/products/${product._id}`,
          { method: "DELETE" },
          token,
        );
      } else {
        await apiRequest(
          `/admin/products/${product._id}`,
          {
            method: "PATCH",
            body: JSON.stringify({ ...product, isActive: true }),
          },
          token,
        );
      }
      await refreshAdminData();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not update this product.",
      );
    }
  }

  async function permanentlyDeleteProduct(product: Product) {
    if (
      !product._id ||
      !window.confirm(
        `Permanently delete "${product.name}"? This cannot be undone. Existing order history will be kept.`,
      )
    )
      return;
    setError("");
    try {
      await apiRequest(
        `/admin/products/${product._id}/permanent`,
        { method: "DELETE" },
        token,
      );
      setProducts((current) =>
        current.filter((currentProduct) => currentProduct._id !== product._id),
      );
      await refreshAdminData();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not permanently delete this product.",
      );
    }
  }

  async function updateOrderStatus(orderId: string, status: Order["status"]) {
    setError("");
    try {
      const result = await apiRequest<{ order: Order }>(
        `/admin/orders/${orderId}`,
        { method: "PATCH", body: JSON.stringify({ status }) },
        token,
      );
      setOrders((current) =>
        current.map((order) => (order._id === orderId ? result.order : order)),
      );
      await refreshAdminData();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not update this order.",
      );
    }
  }

  if (!authReady || (token && loading && !admin)) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <LoaderCircle className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  if (!token) {
    return (
      <CustomerAuthPage
        mode="login"
        onAdminAuthenticated={(authenticatedAdmin) => {
          setToken(window.localStorage.getItem("novashop-admin-token") ?? "");
          setAdmin(authenticatedAdmin);
        }}
        onCustomerAuthenticated={() => {
          void navigate({ to: "/" });
        }}
      />
    );
  }

  const filteredProducts = products.filter((product) =>
    [product.name, product.brand, product.category].some((value) =>
      value?.toLowerCase().includes(search.toLowerCase()),
    ),
  );
  const filteredOrders = orders.filter(
    (order) => orderStatus === "All" || order.status === orderStatus,
  );

  return (
    <div className="min-h-screen bg-background p-3 font-sans text-foreground sm:p-4">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1600px] gap-4 lg:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-5 rounded-3xl bg-card p-4 shadow-soft lg:sticky lg:top-4 lg:h-[calc(100dvh-2rem)]">
          <Link to="/" className="flex items-center gap-3 px-2 py-1">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-bold">NovaShop</span>
              <span className="block text-xs text-muted-foreground">
                Admin console
              </span>
            </span>
          </Link>
          <nav
            aria-label="Admin navigation"
            className="flex gap-2 overflow-x-auto lg:flex-col"
          >
            {sections.map(({ id, label, icon: Icon, to }) => (
              <Link
                key={id}
                to={to}
                aria-current={section === id ? "page" : undefined}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium lg:w-full ${section === id ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent"}`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto flex items-center justify-between gap-2 border-t pt-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {admin?.name ?? "Admin"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                Store administrator
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </aside>
        <main className="min-w-0 space-y-5">
          <header className="rounded-3xl bg-card p-5 shadow-soft sm:p-6">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">
              Store management
            </p>
            <h1 className="text-2xl font-bold sm:text-3xl">
              {sections.find((item) => item.id === section)?.label ??
                "Admin dashboard"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Welcome, {admin?.name ?? "Admin"}. Here is your store at a glance.
            </p>
          </header>
          {error && <ErrorNotice message={error} />}
          {section === "chat" && <AdminChat token={token} />}
          {section === "overview" && dashboard && (
            <Overview
              dashboard={dashboard}
              orders={orders}
              openOrders={() => void navigate({ to: "/admin/recent-orders" })}
            />
          )}
          {section === "products" && (
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">Products</h2>
                  <p className="text-sm text-muted-foreground">
                    Add and update the catalog shown in your storefront.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setEditingId(null);
                    setDraft({ ...emptyDraft });
                    setSelectedImage(null);
                    setError("");
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add product
                </Button>
              </div>
              <label className="flex max-w-md items-center gap-2 rounded-full bg-card px-4 py-2.5 shadow-soft">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  aria-label="Search products"
                  placeholder="Search products..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                />
              </label>
              {draft && (
                <ProductForm
                  draft={draft}
                  setDraft={setDraft}
                  editing={Boolean(editingId)}
                  saving={saving}
                  onCancel={() => {
                    setDraft(null);
                    setEditingId(null);
                    setSelectedImage(null);
                  }}
                  imageFile={selectedImage}
                  setImageFile={setSelectedImage}
                  onSubmit={saveProduct}
                />
              )}
              <div className="overflow-x-auto rounded-2xl bg-card shadow-soft">
                <table className="w-full min-w-[780px] text-left text-sm">
                  <thead className="border-b text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="p-4">Product</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4">Visibility</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredProducts.map((product) => (
                      <tr key={product._id}>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={productImage(product.img)}
                              alt=""
                              className="h-12 w-12 rounded-xl bg-muted object-cover"
                            />
                            <div>
                              <p className="font-semibold">{product.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {product.brand}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {product.category}
                        </td>
                        <td className="p-4 font-semibold">
                          {formatPrice(product.price)}
                        </td>
                        <td className="p-4">{product.stock ?? 0}</td>
                        <td className="p-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${product.isActive ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}
                          >
                            {product.isActive ? "Visible" : "Archived"}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Edit ${product.name}`}
                              onClick={() => {
                                setEditingId(product._id ?? null);
                                setSelectedImage(null);
                                setDraft({
                                  ...emptyDraft,
                                  ...product,
                                  old: product.old,
                                  stock: product.stock ?? 0,
                                  isActive: product.isActive ?? true,
                                });
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`${product.isActive ? "Archive" : "Restore"} ${product.name}`}
                              onClick={() => archiveProduct(product)}
                            >
                              {product.isActive ? (
                                <EyeOff className="h-4 w-4 text-destructive" />
                              ) : (
                                <Eye className="h-4 w-4 text-success" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Permanently delete ${product.name}`}
                              onClick={() => permanentlyDeleteProduct(product)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!filteredProducts.length && (
                      <tr>
                        <td
                          colSpan={6}
                          className="p-8 text-center text-muted-foreground"
                        >
                          No products match your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}
          {section === "inventory" && (
            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-bold">Inventory</h2>
                <p className="text-sm text-muted-foreground">
                  Review stock levels and save quantity updates.
                </p>
              </div>
              <div className="overflow-x-auto rounded-2xl bg-card shadow-soft">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="border-b text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="p-4">Product</th>
                      <th className="p-4">Availability</th>
                      <th className="p-4">Stock quantity</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {products.map((product) => {
                      const stock = stockValues[product._id ?? ""] ?? 0;
                      return (
                        <tr key={product._id ?? product.name}>
                          <td className="p-4">
                            <p className="font-semibold">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {product.brand}
                            </p>
                          </td>
                          <td className="p-4">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${stock === 0 ? "bg-destructive/10 text-destructive" : stock <= 5 ? "bg-sale/10 text-sale" : "bg-success/10 text-success"}`}
                            >
                              {stock === 0
                                ? "Out of stock"
                                : stock <= 5
                                  ? "Low stock"
                                  : "In stock"}
                            </span>
                            {!product.isActive && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                Archived
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <Input
                              aria-label={`Stock quantity for ${product.name}`}
                              type="number"
                              min="0"
                              step="1"
                              value={stock}
                              onChange={(event) =>
                                setStockValues((current) => ({
                                  ...current,
                                  [product._id ?? ""]: Number(
                                    event.target.value,
                                  ),
                                }))
                              }
                              className="w-28"
                            />
                          </td>
                          <td className="p-4 text-right">
                            <Button
                              size="sm"
                              disabled={
                                savingStockId === product._id ||
                                stock === (product.stock ?? 0)
                              }
                              onClick={() => void saveStock(product)}
                            >
                              {savingStockId === product._id
                                ? "Saving…"
                                : "Save stock"}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                    {!products.length && (
                      <tr>
                        <td
                          colSpan={4}
                          className="p-8 text-center text-muted-foreground"
                        >
                          No products to manage.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}
          {section === "recent-orders" && (
            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-bold">Recent orders</h2>
                <p className="text-sm text-muted-foreground">
                  The latest 10 orders, including customer contact and delivery
                  details.
                </p>
              </div>
              {orders.slice(0, 10).map((order) => (
                <article
                  key={order._id}
                  className="space-y-3 rounded-2xl bg-card p-5 shadow-soft"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{order.customer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Order #{order._id.slice(-8).toUpperCase()} ·{" "}
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">
                        {formatPrice(order.total)}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                  <div className="grid gap-2 border-t pt-3 text-sm sm:grid-cols-2">
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {order.customer.email}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {order.customer.phone ?? "Not provided"}
                    </p>
                    <p className="sm:col-span-2">
                      <span className="font-medium">Delivery:</span>{" "}
                      {[
                        order.customer.address,
                        order.customer.city,
                        order.customer.province,
                        order.customer.postalCode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    <p className="sm:col-span-2 text-muted-foreground">
                      {order.items
                        .map((item) => `${item.name} × ${item.quantity}`)
                        .join(" · ")}
                    </p>
                  </div>
                </article>
              ))}
              {!orders.length && (
                <p className="rounded-2xl bg-card p-8 text-center text-sm text-muted-foreground">
                  New orders will show here after checkout.
                </p>
              )}
            </section>
          )}
          {section === "orders" && (
            <section className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">Orders</h2>
                  <p className="text-sm text-muted-foreground">
                    Review customer orders and update their fulfillment status.
                  </p>
                </div>
                <label className="space-y-1 text-xs text-muted-foreground">
                  Filter by status
                  <select
                    value={orderStatus}
                    onChange={(event) => setOrderStatus(event.target.value)}
                    className="block rounded-xl border bg-card px-3 py-2 text-sm text-foreground"
                  >
                    <option>All</option>
                    <option>Processing</option>
                    <option>Shipped</option>
                    <option>Delivered</option>
                    <option>Cancelled</option>
                  </select>
                </label>
              </div>
              <div className="overflow-x-auto rounded-2xl bg-card shadow-soft">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="border-b text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="p-4">Order</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Total</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredOrders.map((order) => (
                      <tr key={order._id}>
                        <td className="p-4 font-mono text-xs">
                          #{order._id.slice(-8).toUpperCase()}
                          <p className="mt-1 font-sans text-xs text-muted-foreground">
                            {order.items.reduce(
                              (sum, item) => sum + item.quantity,
                              0,
                            )}{" "}
                            items
                          </p>
                        </td>
                        <td className="p-4">
                          <p className="font-medium">{order.customer.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.customer.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.customer.phone ?? "No phone provided"}
                          </p>
                          <p className="max-w-64 text-xs text-muted-foreground">
                            {[
                              order.customer.address,
                              order.customer.city,
                              order.customer.province,
                              order.customer.postalCode,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 font-semibold">
                          {formatPrice(order.total)}
                        </td>
                        <td className="p-4">
                          <select
                            aria-label={`Status for order ${order._id}`}
                            value={order.status}
                            onChange={(event) =>
                              updateOrderStatus(
                                order._id,
                                event.target.value as Order["status"],
                              )
                            }
                            className="rounded-full border bg-card px-3 py-1.5 text-xs font-medium"
                          >
                            <option>Processing</option>
                            <option>Shipped</option>
                            <option>Delivered</option>
                            <option>Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                    {!filteredOrders.length && (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-8 text-center text-muted-foreground"
                        >
                          No orders yet. Completed customer checkouts will
                          appear here.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

function Overview({
  dashboard,
  orders,
  openOrders,
}: {
  dashboard: Dashboard;
  orders: Order[];
  openOrders: () => void;
}) {
  const stats = [
    {
      title: "Total revenue",
      value: formatPrice(dashboard.metrics.revenue),
      icon: ArrowUpRight,
      note: "Excluding cancelled orders",
    },
    {
      title: "Orders",
      value: dashboard.metrics.orderCount.toLocaleString(),
      icon: ShoppingCart,
      note: `${dashboard.metrics.pendingOrders} awaiting processing`,
    },
    {
      title: "Active products",
      value: dashboard.metrics.activeProducts.toLocaleString(),
      icon: Package,
      note: `${dashboard.metrics.productCount} total in catalog`,
    },
  ];
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(({ title, value, icon: Icon, note }, index) => (
          <article key={title} className="rounded-2xl bg-card p-5 shadow-soft">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{title}</p>
                <p className="mt-2 text-2xl font-bold">{value}</p>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-primary">
                <Icon className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
              {index === 0 ? (
                <ArrowUpRight className="h-3.5 w-3.5 text-success" />
              ) : index === 1 && dashboard.metrics.pendingOrders ? (
                <ArrowDownRight className="h-3.5 w-3.5 text-sale" />
              ) : null}
              {note}
            </p>
          </article>
        ))}
      </div>
      <section className="overflow-hidden rounded-2xl bg-card shadow-soft">
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h2 className="font-bold">Recent orders</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Latest activity from your customers.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={openOrders}
            className="rounded-full"
          >
            View all
          </Button>
        </div>
        {orders.slice(0, 5).length ? (
          <div className="divide-y">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order._id}
                className="flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div>
                  <p className="text-sm font-semibold">{order.customer.name}</p>
                  <p className="text-xs text-muted-foreground">
                    #{order._id.slice(-8).toUpperCase()} ·{" "}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold">
                    {formatPrice(order.total)}
                  </span>
                  <StatusBadge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">
            <ShoppingCart className="mx-auto mb-3 h-6 w-6 text-primary" />
            New orders will show here after checkout.
          </div>
        )}
      </section>
    </div>
  );
}

function ProductForm({
  draft,
  setDraft,
  editing,
  saving,
  imageFile,
  setImageFile,
  onCancel,
  onSubmit,
}: {
  draft: ProductDraft;
  setDraft: (draft: ProductDraft) => void;
  editing: boolean;
  saving: boolean;
  imageFile: File | null;
  setImageFile: (file: File | null) => void;
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const [imagePreview, setImagePreview] = useState("");
  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return;
    }
    const preview = URL.createObjectURL(imageFile);
    setImagePreview(preview);
    return () => URL.revokeObjectURL(preview);
  }, [imageFile]);

  const textField = (
    key: "name" | "sub" | "category" | "brand",
    label: string,
    placeholder = "",
  ) => (
    <label key={key} className="space-y-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <Input
        required
        value={draft[key]}
        placeholder={placeholder}
        onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}
      />
    </label>
  );
  const numberField = (
    key: "price" | "old" | "off" | "stock",
    label: string,
  ) => (
    <label key={key} className="space-y-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <Input
        required={key !== "old"}
        type="number"
        min="0"
        step={key === "stock" || key === "off" ? "1" : "0.01"}
        value={draft[key] ?? ""}
        onChange={(event) =>
          setDraft({
            ...draft,
            [key]:
              event.target.value === ""
                ? undefined
                : Number(event.target.value),
          })
        }
      />
    </label>
  );
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border bg-card p-5 shadow-soft"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold">
            {editing ? "Edit product" : "Add a product"}
          </h3>
          <p className="text-xs text-muted-foreground">
            Changes are published to the storefront right away.
          </p>
        </div>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {textField("name", "Product name")}
        {textField("sub", "Description / variant")}
        {textField("brand", "Brand")}
        {textField("category", "Category")}
        <label className="space-y-1.5 text-sm">
          <span className="font-medium">Product image</span>
          <Input
            required={!editing && !draft.img}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
            className="h-auto py-2"
          />
          <span className="block text-xs text-muted-foreground">
            Choose a JPEG, PNG, or WebP image (maximum 5 MB).
          </span>
        </label>
        {numberField("price", "Price")}
        {numberField("old", "Previous price")}
        {numberField("off", "Discount (%)")}
        {numberField("stock", "Stock")}
      </div>
      <div className="flex flex-wrap gap-5 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={draft.isNew ?? false}
            onChange={(event) =>
              setDraft({ ...draft, isNew: event.target.checked })
            }
          />
          New arrival
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={draft.isActive}
            onChange={(event) =>
              setDraft({ ...draft, isActive: event.target.checked })
            }
          />
          Visible in store
        </label>
      </div>
      {(imagePreview || draft.img) && (
        <img
          src={imagePreview || productImage(draft.img)}
          alt="Product preview"
          className="h-24 w-24 rounded-xl bg-muted object-cover"
        />
      )}
      <Button type="submit" disabled={saving}>
        {saving && <LoaderCircle className="h-4 w-4 animate-spin" />}
        {editing ? "Save changes" : "Create product"}
      </Button>
    </form>
  );
}

function ErrorNotice({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"
    >
      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
      {message}
    </p>
  );
}

function StatusBadge({ status }: { status: Order["status"] }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${status === "Delivered" ? "bg-success/10 text-success" : status === "Cancelled" ? "bg-destructive/10 text-destructive" : status === "Shipped" ? "bg-accent text-primary" : "bg-muted text-muted-foreground"}`}
    >
      {status}
    </span>
  );
}
