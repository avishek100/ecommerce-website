import { createFileRoute } from '@tanstack/react-router';
import { ShopPageView } from '@/components/shop/shop-pages';
import { pageHead } from '@/components/shop/shop-data';

export const Route = createFileRoute('/new-arrivals')({
  head: () => pageHead('new-arrivals'),
  component: Page,
});
function Page() { return <ShopPageView page="new-arrivals" />; }
