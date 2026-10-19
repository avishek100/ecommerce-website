import hero from '@/assets/hero.jpg';
import sneaker from '@/assets/sneaker.jpg';
import bag from '@/assets/bag.jpg';
import watch from '@/assets/watch.jpg';

export type Product = { name: string; sub: string; price: number; old?: number; img: string; off?: number; rating?: number; reviews?: number; category?: string; brand?: string; isNew?: boolean };
export const products: Product[] = [
  { name: 'Air Max 270 React', sub: "Women's Shoes", price: 129.99, old: 159.99, img: sneaker, off: 25, rating: 4.8, reviews: 124, category: 'Sports', brand: 'Nike' },
  { name: 'Apple Watch Series 9', sub: '41mm Midnight', price: 359, old: 449, img: watch, off: 20, rating: 4.9, reviews: 98, category: 'Electronics', brand: 'Apple', isNew: true },
  { name: 'Minimalist Shoulder Bag', sub: 'Olive Green', price: 39.99, old: 49.99, img: bag, off: 20, rating: 4.9, reviews: 176, category: 'Fashion', brand: 'Nova Essentials', isNew: true },
  { name: 'Oversized Cotton Shirt', sub: 'Beige', price: 29.99, old: 35, img: hero, off: 15, rating: 4.7, reviews: 62, category: 'Fashion', brand: 'Nova Essentials', isNew: true },
  { name: 'Fossil Gen 6 Smartwatch', sub: 'Black Silicone', price: 215.1, old: 339, img: watch, off: 10, rating: 4.6, reviews: 54, category: 'Electronics', brand: 'Fossil' },
];
export const categories = ['Fashion', 'Beauty', 'Electronics', 'Home & Living', 'Sports'] as const;
export const formatPrice = (n: number) => `$${n.toFixed(2)}`;
export const pageInfo = {
  categories: ['Categories', 'Explore fashion, beauty, electronics, home and sports at NovaShop.'],
  deals: ['Deals', 'Discover NovaShop offers on everyday favorites.'],
  'new-arrivals': ['New Arrivals', 'Discover the latest additions to NovaShop.'],
  'best-sellers': ['Best Sellers', 'Shop popular NovaShop favorites.'],
  brands: ['Brands', 'Browse Nike, Apple, Fossil and Nova Essentials at NovaShop.'],
  collections: ['Collections', 'Explore curated NovaShop collections for every day.'],
  'my-orders': ['My Orders', 'View your NovaShop orders and delivery details.'],
  wishlist: ['Wishlist', 'Keep your favorite NovaShop finds in one place.'],
  coupons: ['Coupons', 'View your available NovaShop coupons.'],
  addresses: ['Addresses', 'Manage your NovaShop delivery addresses.'],
  'account-settings': ['Account Settings', 'Manage your NovaShop profile and preferences.'],
} as const;
export type ShopPage = keyof typeof pageInfo;
export function pageHead(page: ShopPage) {
  const [title, description] = pageInfo[page];
  return { meta: [{ title: `${title} — NovaShop` }, { name: 'description', content: description }, { property: 'og:title', content: `${title} — NovaShop` }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }], links: [{ rel: 'canonical', href: `/${page}` }] };
}
