import { createFileRoute } from '@tanstack/react-router';
import { ShopPageView } from '@/components/shop/shop-pages';
import { pageHead } from '@/components/shop/shop-data';

export const Route = createFileRoute('/coupons')({
  head: () => pageHead('coupons'),
  component: Page,
});
function Page() { return <ShopPageView page="coupons" />; }
