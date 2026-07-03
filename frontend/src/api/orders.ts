import { getApiBaseUrl } from './config';

export interface ApiOrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface CreateOrderPayload {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  items: ApiOrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: string;
}

export interface ApiOrder extends CreateOrderPayload {
  _id: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface AdminOrder {
  _id: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  items: AdminOrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Public: Submit a new order to the backend.
 */
export async function createOrder(payload: CreateOrderPayload): Promise<ApiOrder> {
  const res = await fetch(`${getApiBaseUrl()}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to place order. Please try again.');
  }
  return res.json();
}

/**
 * Public: Fetch details of a single order by ID.
 */
export async function fetchOrderById(id: string): Promise<ApiOrder> {
  const res = await fetch(`${getApiBaseUrl()}/orders/${id}`);
  if (!res.ok) throw new Error('Order not found');
  return res.json();
}

/**
 * Public: Fetch all orders for a specific user by email.
 */
export async function fetchOrdersByUser(email: string): Promise<ApiOrder[]> {
  const res = await fetch(`${getApiBaseUrl()}/orders?email=${encodeURIComponent(email)}`);
  if (!res.ok) throw new Error('Failed to fetch user orders');
  return res.json();
}

/**
 * Admin: Fetch all orders.
 */
export const fetchOrdersAdmin = async (): Promise<AdminOrder[]> => {
  const res = await fetch(`${getApiBaseUrl()}/orders`);
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
};

/**
 * Admin: Update order status / payment status.
 */
export const updateOrderAdmin = async (
  id: string,
  payload: { orderStatus?: string; paymentStatus?: string }
): Promise<AdminOrder> => {
  const res = await fetch(`${getApiBaseUrl()}/orders/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update order status');
  return res.json();
};
