export class CreateProductDto {
  title: string;
  description?: string;
  price: number;
  category?: string;
  imageUrls?: string[];
  stock?: number;
  isActive?: boolean;
  wearType?: string;
}
