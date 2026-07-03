import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto implements Partial<CreateProductDto> {
  title?: string;
  description?: string;
  price?: number;
  category?: string;
  imageUrls?: string[];
  stock?: number;
  isActive?: boolean;
  wearType?: string;
}
