import { createContext, useContext, useState, type ReactNode } from 'react';
import { products, type Product } from './shop-data';
import watch from '@/assets/watch.jpg';

export type CartItem = Product & { size: string; qty: number };
export type Address = { id: string; label: string; name: string; street: string; city: string; postcode: string; country: string };
function useShopState() {
  const [cart, setCart] = useState<CartItem[]>(() => products.slice(0, 3).map(p => ({ ...p, size: p.sub, qty: 1 })));
  const [wish, setWish] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [profile, setProfile] = useState({ name: 'Alina Putri', email: '', phone: '', offers: false });
  const add = (p: Product) => setCart(c => c.some(i => i.name === p.name) ? c.map(i => i.name === p.name ? { ...i, qty: i.qty + 1 } : i) : [...c, { ...p, size: p.sub, qty: 1 }]);
  const qty = (name: string, delta: number) => setCart(c => c.map(i => i.name === name ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  const remove = (name: string) => setCart(c => c.filter(i => i.name !== name));
  const toggleWish = (name: string) => setWish(w => w.includes(name) ? w.filter(n => n !== name) : [...w, name]);
  return { cart, setCart, wish, search, setSearch, add, qty, remove, toggleWish, addresses, setAddresses, profile, setProfile };
}
const ShopContext = createContext<ReturnType<typeof useShopState> | null>(null);
export function ShopProvider({ children }: { children: ReactNode }) {
  const shop = useShopState();
  return <ShopContext.Provider value={shop}>{children}</ShopContext.Provider>;
}
export function useShop() {
  const shop = useContext(ShopContext);
  if (!shop) throw new Error('ShopProvider is required');
  return shop;
}
