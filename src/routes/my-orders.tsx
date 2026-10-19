import { createFileRoute } from '@tanstack/react-router';
import { ShopPageView } from '@/components/shop/shop-pages';
import { pageHead } from '@/components/shop/shop-data';

export const Route = createFileRoute('/my-orders')({
  head: () => pageHead('my-orders'),
  component: Page,
});
function Page() { return <ShopPageView page="my-orders" />; }
