import { Header } from "@/components/header";
import { CheckoutClient } from "@/components/checkout-client";

export default function CheckoutPage() {
  return (
    <div className="min-h-full bg-zinc-50">
      <Header />
      <CheckoutClient />
    </div>
  );
}
