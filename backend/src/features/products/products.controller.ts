import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * PUBLIC: Get all active products (for user frontend)
   * GET /products
   */
  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('wearType') wearType?: string,
  ) {
    return this.productsService.findAll(category, wearType);
  }

  /**
   * ADMIN: Get all products including inactive ones
   * GET /products/admin/all
   */
  @Get('admin/all')
  findAllAdmin() {
    return this.productsService.findAllAdmin();
  }

  /**
   * PUBLIC: Get reviews for a product
   * GET /products/:id/reviews
   */
  @Get(':id/reviews')
  getReviews(@Param('id') id: string) {
    return this.productsService.getReviews(id);
  }

  /**
   * PUBLIC: Submit a review for a product
   * POST /products/:id/reviews
   */
  @Post(':id/reviews')
  @HttpCode(HttpStatus.CREATED)
  addReview(@Param('id') id: string, @Body() createReviewDto: CreateReviewDto) {
    return this.productsService.addReview(id, createReviewDto);
  }

  /**
   * PUBLIC: Get single product by ID (returns all imageUrls for detail page)
   * GET /products/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  /**
   * ADMIN: Create a new product
   * POST /products
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  /**
   * ADMIN: Update a product (partial update)
   * PATCH /products/:id
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  /**
   * ADMIN: Delete a product permanently
   * DELETE /products/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
