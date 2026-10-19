import { Link, createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useShop } from "@/components/shop/shop-context";
import {
  ShoppingBag, Home, LayoutGrid, Tag, Sparkles, ThumbsUp, Gem, BookOpen, ClipboardList, Heart,
  Ticket, MapPin, Settings, Headphones, Sun, ChevronRight, Search, Bell, ChevronDown, ArrowRight,
  Shirt, SprayCan, Sofa, Footprints, Grid2x2, X, Trash2, Minus, Plus, Lock, Star, ShieldCheck,
  RotateCcw, Truck, ShoppingCart, Menu,
} from "lucide-react";
import hero from "@/assets/hero.jpg";
import sneaker from "@/assets/sneaker.jpg";
import bag from "@/assets/bag.jpg";
import watch from "@/assets/watch.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NovaShop — Find Your Style, Love Your Look" },
      { name: "description", content: "Shop the latest trends in fashion, beauty, electronics and lifestyle at NovaShop." },
      { property: "og:title", content: "NovaShop — Find Your Style" },
      { property: "og:description", content: "Shop the latest trends in fashion, beauty, electronics and lifestyle." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const nav1 = [
  [Home, "Home"], [LayoutGrid, "Categories"], [Tag, "Deals"], [Sparkles, "New Arrivals"],
  [ThumbsUp, "Best Sellers"], [Gem, "Brands"], [BookOpen, "Collections"],
] as const;
const nav2 = [[ClipboardList, "My Orders"], [Heart, "Wishlist"], [Ticket, "Coupons"], [MapPin, "Addresses"], [Settings, "Account Settings"]] as const;
const cats = [[Shirt, "Fashion"], [SprayCan, "Beauty"], [Headphones, "Electronics"], [Sofa, "Home & Living"], [Footprints, "Sports"], [Grid2x2, "More"]] as const;

type P = { name: string; sub: string; price: number; old?: number; img: string; off?: number; rating?: number; reviews?: number };
const deals: P[] = [
  { name: "Air Max 270 React", sub: "Women's Shoes", price: 129.99, old: 159.99, img: sneaker, off: 25, rating: 4.8, reviews: 124 },
  { name: "Apple Watch Series 9", sub: "41mm Midnight", price: 359, old: 449, img: watch, off: 20, rating: 4.9, reviews: 98 },
  { name: "Chanel Chance Eau", sub: "Tendre EDP 100ml", price: 89.99, old: 129.99, img: watch, off: 30, rating: 4.7, reviews: 86 },
  { name: "Minimalist Shoulder Bag", sub: "Olive Green", price: 39.99, old: 49.99, img: bag, off: 20, rating: 4.9, reviews: 176 },
];
const recs: P[] = [
  { name: "Oversized Cotton Shirt", sub: "Beige", price: 29.99, old: 35, img: hero, off: 15 },
  { name: "Minimalist Shoulder Bag", sub: "Olive Green", price: 39.99, old: 49.99, img: bag, off: 20 },
  { name: "Air Max 270 React", sub: "White Lavender", price: 6.75 * 20, old: 160, img: sneaker, off: 25 },
  { name: "Fossil Gen 6 Smartwatch", sub: "Black Silicone", price: 215.1, old: 339, img: watch, off: 10 },
];

const fmt = (n: number) => `$${n.toFixed(2)}`;

function Index() {
  const { cart, setCart, wish, add, qty, toggleWish, search } = useShop();
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = cart.length ? 45.5 : 0;

  return (
    <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <main className="min-w-0 space-y-4">
          <section className="relative h-56 overflow-hidden sm:h-64 rounded-3xl bg-hero text-primary-foreground">
            <img src={hero} alt="Fashion model" width={1024} height={768} className="absolute right-0 top-0 h-full w-3/5 object-cover object-right opacity-90 [mask-image:linear-gradient(to_right,transparent,black_35%)]" />
            <div className="relative p-6 sm:p-8">
              <span className="rounded-full border border-primary-foreground/50 bg-primary-foreground/15 px-3 py-1 text-xs">New Collection</span>
              <h1 className="mt-4 text-2xl font-bold sm:text-3xl leading-tight">Find Your Style,<br />Love Your Look ✨</h1>
              <p className="mt-3 max-w-xs text-sm opacity-90">Discover the latest trends in fashion, beauty, and lifestyle.</p>
              <Button asChild variant="secondary" className="mt-5 rounded-full bg-card text-primary"><Link to="/new-arrivals">Shop Now <ArrowRight className="h-4 w-4" /></Link></Button>
            </div>
          </section>

          <section className="grid grid-cols-3 gap-4 rounded-3xl bg-card p-5 shadow-soft sm:grid-cols-6">
            {cats.map(([I, l]) => (
              <Button asChild variant="ghost" key={l} className="h-auto flex-col gap-2 p-0 text-xs font-medium"><Link to="/categories">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-accent text-accent-foreground"><I className="h-5 w-5" /></span>{l}
              </Link></Button>
            ))}
          </section>

          <section className="grid gap-4 sm:grid-cols-3">
            <Promo bg="bg-peach" title="Flash Sale" sub="Limited time deals" img={bag} extra={<><p className="text-xs text-sale">Up to 70% Off</p><p className="mt-3 inline-block rounded-lg bg-card px-2 py-1 text-xs font-semibold text-sale">02 : 45 : 18</p></>} />
            <Promo bg="bg-mint" title="Free Shipping" sub="On orders over $50" img={sneaker} extra={<p className="mt-3 text-xs">Shop now →</p>} />
            <Promo bg="bg-cream" title="New Arrivals" sub="Check out the latest trends" img={watch} extra={<p className="mt-3 text-xs">Shop now →</p>} />
          </section>

          <Section title="Best Deals for You" to="/deals">
            {deals.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map((p) => <Card key={p.name} p={p} wished={wish.includes(p.name)} onWish={() => toggleWish(p.name)} onAdd={() => add(p)} />)}
          </Section>
          <Section title="Recommended for You" to="/best-sellers">
            {recs.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map((p) => <Card key={p.name + "r"} p={p} cartBtn wished={wish.includes(p.name)} onWish={() => toggleWish(p.name)} onAdd={() => add(p)} />)}
          </Section>

          <section className="grid grid-cols-2 gap-4 rounded-3xl bg-accent p-5 sm:grid-cols-4">
            {[[ShieldCheck, "Secure Payment", "100% secure payment"], [RotateCcw, "Easy Returns", "30-day return policy"], [Headphones, "24/7 Support", "Dedicated support"], [Star, "Trusted by Thousands", "4.8 average rating"]].map(([I, t, s]) => {
              const Ic = I as typeof Star;
              return <div key={t as string} className="flex items-center gap-3"><Ic className="h-6 w-6 text-primary" /><div><p className="text-xs font-semibold">{t as string}</p><p className="text-[11px] text-muted-foreground">{s as string}</p></div></div>;
            })}
          </section>
        </main>

        {/* Cart */}
        <aside className="min-w-0 space-y-4 xl:col-start-auto">
          <div className="rounded-3xl bg-card p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between"><h2 className="font-bold">My Cart ({cart.length})</h2><X className="h-5 w-5" /></div>
            <div className="divide-y">
              {cart.map((i) => (
                <div key={i.name} className="flex gap-3 py-3">
                  <img src={i.img} alt={i.name} loading="lazy" className="h-20 w-20 rounded-xl bg-muted object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-tight">{i.name}</p>
                    <p className="text-xs text-muted-foreground">{i.size}</p>
                    <p className="mt-1 text-sm font-bold">{fmt(i.price)}</p>
                    <div className="mt-1 flex items-center gap-3">
                      <Button variant="ghost" onClick={() => qty(i.name, -1)} className="grid h-6 w-6 place-items-center rounded-full border"><Minus className="h-3 w-3" /></Button>
                      <span className="text-sm">{i.qty}</span>
                      <Button variant="ghost" onClick={() => qty(i.name, 1)} className="grid h-6 w-6 place-items-center rounded-full border"><Plus className="h-3 w-3" /></Button>
                      <Button variant="ghost" onClick={() => setCart((c) => c.filter((x) => x.name !== i.name))} className="ml-auto text-muted-foreground"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2"><input placeholder="Promo Code" className="min-w-0 flex-1 rounded-xl border px-3 text-sm outline-none" /><Button variant="ghost" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Apply</Button></div>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{fmt(subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Discount</dt><dd className="text-sale">-{fmt(discount)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd className="text-sale">Free</dd></div>
              <div className="flex justify-between border-t pt-2 text-base font-bold"><dt>Total</dt><dd>{fmt(Math.max(0, subtotal - discount))}</dd></div>
            </dl>
            <Button variant="ghost" className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground"><Lock className="h-4 w-4" />Checkout ({cart.length})</Button>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">We accept VISA · Mastercard · PayPal · Apple Pay · G Pay</p>
          </div>

          <div className="rounded-3xl bg-card p-5 shadow-soft">
            <h3 className="mb-3 text-sm font-bold">You might also like</h3>
            {deals.slice(0, 2).map((p) => (
              <div key={p.name} className="flex items-center gap-3 py-2">
                <img src={p.img} alt={p.name} loading="lazy" className="h-16 w-16 rounded-xl object-cover" />
                <div className="flex-1"><p className="text-sm font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.sub}</p><p className="text-sm font-bold">{fmt(p.price)}</p></div>
                <Button variant="ghost" onClick={() => add(p)} className="grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground"><Plus className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>

          <div className="rounded-3xl bg-card p-5 shadow-soft">
            <h3 className="mb-3 text-sm font-bold">Recently Viewed</h3>
            <div className="grid grid-cols-4 gap-2">{[watch, hero, bag, sneaker].map((s, i) => <img key={i} src={s} alt="" loading="lazy" className="aspect-square rounded-lg object-cover" />)}</div>
          </div>

          <div className="rounded-3xl bg-promo p-5 text-primary-foreground">
            <p className="font-bold">Join NovaShop Club</p>
            <p className="mt-1 text-xs opacity-90">Get exclusive offers, early access and more!</p>
            <Button variant="ghost" className="mt-3 rounded-full bg-card px-4 py-1.5 text-xs font-semibold text-primary">Join Now</Button>
          </div>
        </aside>
    </div>
  );
}

function Promo({ bg, title, sub, img, extra }: { bg: string; title: string; sub: string; img: string; extra: React.ReactNode }) {
  return (
    <div className={`relative flex h-32 overflow-hidden rounded-3xl ${bg} p-4`}>
      <div className="z-10"><p className="font-bold">{title}</p><p className="text-xs text-muted-foreground">{sub}</p>{extra}</div>
      <img src={img} alt="" loading="lazy" className="absolute -right-2 bottom-0 h-28 w-28 rounded-2xl object-cover mix-blend-multiply" />
    </div>
  );
}

function Section({ title, children, to }: { title: string; children: React.ReactNode; to: "/deals" | "/best-sellers" }) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between"><h2 className="font-bold">{title}</h2><Button asChild variant="secondary" size="sm" className="rounded-full bg-card shadow-soft"><Link to={to}>View All</Link></Button></div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{children}</div>
    </section>
  );
}

function Card({ p, wished, onWish, onAdd, cartBtn }: { p: P; wished: boolean; onWish: () => void; onAdd: () => void; cartBtn?: boolean }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-card shadow-soft">
      <div className="relative">
        <img src={p.img} alt={p.name} loading="lazy" className="aspect-[4/4.2] w-full object-cover" />
        {p.off && <span className="absolute left-2 top-2 rounded-md bg-sale px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">-{p.off}%</span>}
        <Button variant="ghost" onClick={onWish} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-card"><Heart className={`h-3.5 w-3.5 ${wished ? "fill-sale text-sale" : ""}`} /></Button>
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-medium">{p.name}</p>
        <p className="text-xs text-muted-foreground">{p.sub}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <span className="font-bold">{fmt(p.price)}</span>
          {p.old && <span className="text-xs text-muted-foreground line-through">{fmt(p.old)}</span>}
          {cartBtn && <Button variant="ghost" onClick={onAdd} aria-label="Add to cart" className="ml-auto grid h-7 w-7 place-items-center rounded-lg bg-primary text-primary-foreground"><ShoppingCart className="h-3.5 w-3.5" /></Button>}
        </div>
        {p.rating && (
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-star text-star" />{p.rating} ({p.reviews})
            <Button variant="ghost" onClick={onAdd} className="ml-auto text-primary"><Truck className="hidden" />+ Add</Button>
          </div>
        )}
      </div>
    </div>
  );
}
