import { Product, CreateProductPayload } from '../features/products/types';
import { getApiBaseUrl } from './config';

export interface ApiProduct {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  wearType?: string;
  imageUrls: string[];
  stock: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Public: Fetch active products from the backend.
 * Supports optional category and wearType filtering.
 */
export async function fetchProducts(category?: string, wearType?: string): Promise<ApiProduct[]> {
  let url = `${getApiBaseUrl()}/products`;
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (wearType) params.append('wearType', wearType);
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

/**
 * Public: Fetch a single product by its database ID.
 */
export async function fetchProductById(id: string): Promise<ApiProduct> {
  const res = await fetch(`${getApiBaseUrl()}/products/${id}`);
  if (!res.ok) throw new Error('Product not found');
  return res.json();
}

/**
 * Admin: Fetch all products (includes inactive ones).
 */
export const fetchProductsAdmin = async (): Promise<Product[]> => {
  const res = await fetch(`${getApiBaseUrl()}/products/admin/all`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
};

/**
 * Admin: Create a new product.
 */
export const createProductAdmin = async (data: CreateProductPayload): Promise<Product> => {
  const res = await fetch(`${getApiBaseUrl()}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create product');
  return res.json();
};

/**
 * Admin: Update a product.
 */
export const updateProductAdmin = async (id: string, data: Partial<CreateProductPayload>): Promise<Product> => {
  const res = await fetch(`${getApiBaseUrl()}/products/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update product');
  return res.json();
};

/**
 * Admin: Delete a product.
 */
export const deleteProductAdmin = async (id: string): Promise<string> => {
  const res = await fetch(`${getApiBaseUrl()}/products/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete product');
  return id;
};
