import { redirect } from "next/navigation";

// Redirect the bare products-list path to its default "online" tab on the
// server, before any client render. This avoids a client-side redirect that
// would mount the products view twice (causing a visible load -> spinner ->
// load "blink") when navigating in from the sidebar.
export default function ProductsListPage() {
  redirect("/dashboard/products-list/online");
}
