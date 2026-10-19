import { createFileRoute } from '@tanstack/react-router';
import { ShopPageView } from '@/components/shop/shop-pages';
import { pageHead } from '@/components/shop/shop-data';

export const Route = createFileRoute('/addresses')({
  head: () => pageHead('addresses'),
  component: Page,
});
function Page() { return <ShopPageView page="addresses" />; }
