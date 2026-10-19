import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { apiRequest } from "@/lib/api";
import type { Product } from "./shop-data";

export type CartItem = Product & { size: string; qty: number };
export type Address = {
  id: string;
  label: string;
  name: string;
  street: string;
  city: string;
  postcode: string;
  country: string;
};
export type Customer = { id: string; name: string; email: string };
const customerTokenKey = "novashop-customer-token";

function useShopState() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [productsError, setProductsError] = useState("");
  const [productsLoading, setProductsLoading] = useState(true);
  const [wish, setWish] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [user, setUser] = useState<Customer | null>(null);
  const [authToken, setAuthToken] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: "Guest",
    email: "",
    phone: "",
    offers: false,
  });
  useEffect(() => {
    const token = window.localStorage.getItem(customerTokenKey);
    if (!token) {
      setAuthLoading(false);
      return;
    }
    setAuthToken(token);
    apiRequest<{ user: Customer }>("/auth/customer/session", {}, token)
      .then(({ user: customer }) => {
        setUser(customer);
        setProfile((current) => ({
          ...current,
          name: customer.name,
          email: customer.email,
        }));
      })
      .catch(() => {
        window.localStorage.removeItem(customerTokenKey);
        setAuthToken("");
      })
      .finally(() => setAuthLoading(false));
  }, []);
  useEffect(() => {
    apiRequest<{ products: Product[] }>("/products")
      .then(({ products: rows }) => setCatalog(rows))
      .catch((error) =>
        setProductsError(
          error instanceof Error ? error.message : "Could not load products.",
        ),
      )
      .finally(() => setProductsLoading(false));
  }, []);
  const add = (p: Product) =>
    setCart((c) =>
      c.some((i) => (i._id ?? i.name) === (p._id ?? p.name))
        ? c.map((i) =>
            (i._id ?? i.name) === (p._id ?? p.name)
              ? { ...i, qty: i.qty + 1 }
              : i,
          )
        : [...c, { ...p, size: p.sub, qty: 1 }],
    );
  const qty = (id: string, delta: number) =>
    setCart((c) =>
      c.map((i) =>
        (i._id ?? i.name) === id
          ? { ...i, qty: Math.max(1, i.qty + delta) }
          : i,
      ),
    );
  const remove = (id: string) =>
    setCart((c) => c.filter((i) => (i._id ?? i.name) !== id));
  const toggleWish = (name: string) =>
    setWish((w) =>
      w.includes(name) ? w.filter((n) => n !== name) : [...w, name],
    );
  async function authenticate(path: string, input: Record<string, string>) {
    const result = await apiRequest<{ token: string; user: Customer }>(path, {
      method: "POST",
      body: JSON.stringify(input),
    });
    setCustomerSession(result.token, result.user);
    return result.user;
  }
  function setCustomerSession(token: string, customer: Customer) {
    window.localStorage.removeItem("novashop-admin-token");
    window.localStorage.setItem(customerTokenKey, token);
    setAuthToken(token);
    setUser(customer);
    setProfile((current) => ({
      ...current,
      name: customer.name,
      email: customer.email,
    }));
  }
  const register = (input: { name: string; email: string; password: string }) =>
    authenticate("/auth/register", input);
  const login = (input: { email: string; password: string }) =>
    authenticate("/auth/customer/login", input);
  function logout() {
    window.localStorage.removeItem(customerTokenKey);
    setAuthToken("");
    setUser(null);
    setProfile((current) => ({ ...current, name: "Guest", email: "" }));
  }
  return {
    cart,
    setCart,
    wish,
    search,
    setSearch,
    add,
    qty,
    remove,
    toggleWish,
    addresses,
    setAddresses,
    profile,
    setProfile,
    products: catalog,
    productsError,
    productsLoading,
    user,
    authToken,
    authLoading,
    login,
    register,
    setCustomerSession,
    logout,
  };
}
const ShopContext = createContext<ReturnType<typeof useShopState> | null>(null);
export function ShopProvider({ children }: { children: ReactNode }) {
  const shop = useShopState();
  return <ShopContext.Provider value={shop}>{children}</ShopContext.Provider>;
}
export function useShop() {
  const shop = useContext(ShopContext);
  if (!shop) throw new Error("ShopProvider is required");
  return shop;
}
