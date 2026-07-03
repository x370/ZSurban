import { ApiProduct } from '../api/products';

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  imageUrl: string;
  quantity: number;
  stock: number;
}

const CART_KEY = 'zsurban_cart';

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(CART_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveCart(cart: CartItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event('cart-updated'));
}

export function addToCart(product: ApiProduct, quantity: number = 1) {
  const cart = getCart();
  const existing = cart.find(item => item.productId === product._id);
  if (existing) {
    existing.quantity = Math.min(product.stock, existing.quantity + quantity);
  } else {
    cart.push({
      productId: product._id,
      title: product.title,
      price: product.price,
      imageUrl: product.imageUrls?.[0] || '',
      quantity: Math.min(product.stock, quantity),
      stock: product.stock
    });
  }
  saveCart(cart);
}

export function removeFromCart(productId: string) {
  const cart = getCart();
  const filtered = cart.filter(item => item.productId !== productId);
  saveCart(filtered);
}

export function updateCartQuantity(productId: string, quantity: number) {
  const cart = getCart();
  const item = cart.find(i => i.productId === productId);
  if (item) {
    item.quantity = Math.max(1, Math.min(item.stock, quantity));
    saveCart(cart);
  }
}

export function clearCart() {
  saveCart([]);
}

export function getCartCount(): number {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartTotal(): number {
  return getCart().reduce((sum, item) => sum + (item.price * item.quantity), 0);
}
