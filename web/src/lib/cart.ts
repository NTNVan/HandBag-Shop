export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

const CART_KEY = "handbagshop_cart";

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToCart(next: Omit<CartItem, "quantity">, qty = 1) {
  const cart = readCart();
  const existing = cart.find((c) => c.productId === next.productId);
  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({ ...next, quantity: qty });
  }
  writeCart(cart);
  return cart;
}

export function removeFromCart(productId: string) {
  const cart = readCart().filter((c) => c.productId !== productId);
  writeCart(cart);
  return cart;
}

export function updateQuantity(productId: string, quantity: number) {
  const cart = readCart();
  const item = cart.find((c) => c.productId === productId);
  if (!item) return cart;
  item.quantity = Math.max(1, quantity);
  writeCart(cart);
  return cart;
}

export function clearCart() {
  writeCart([]);
}
