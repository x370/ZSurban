export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  /**
   * Array of image URLs.
   * imageUrls[0] = primary thumbnail shown on listings/cards
   * imageUrls[1..n] = additional images shown on product detail page gallery
   */
  imageUrls: string[];
  stock: number;
  isActive: boolean;
  wearType?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductsState {
  products: Product[];
  loading: boolean;
  saving: boolean;
  error: string | null;
}

export interface CreateProductPayload {
  title: string;
  description?: string;
  price: number;
  category?: string;
  imageUrls?: string[];
  stock?: number;
  isActive?: boolean;
  wearType?: string;
}

export interface UpdateProductPayload {
  id: string;
  data: Partial<CreateProductPayload>;
}
