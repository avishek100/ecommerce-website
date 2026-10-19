import { createFileRoute } from '@tanstack/react-router';
import { ShopPageView } from '@/components/shop/shop-pages';
import { pageHead } from '@/components/shop/shop-data';

export const Route = createFileRoute('/best-sellers')({
  head: () => pageHead('best-sellers'),
  component: Page,
});
function Page() { return <ShopPageView page="best-sellers" />; }
