export class CreateOrderItemDto {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export class CreateOrderDto {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  items: CreateOrderItemDto[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: string;
}
