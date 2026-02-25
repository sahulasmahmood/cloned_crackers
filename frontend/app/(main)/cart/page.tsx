import CartPageClient from '@/components/cart/CartPageClient';
import { generatePageMetadata } from '@/lib/seo';

export async function generateMetadata() {
  return await generatePageMetadata({
    pagePath: "/cart",
    defaultTitle: "Enquiry List | Leats - Firecrackers & Festive Essentials",
    defaultDescription: "Review your enquiry list and request a quotation. Get the best prices for firecrackers and festive essentials.",
    defaultKeywords: "enquiry list, quotation, firecrackers, bulk order, crackers price list",
  });
}

export default function CartPage() {
  return <CartPageClient />;
}
