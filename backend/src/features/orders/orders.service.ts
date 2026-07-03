import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { MailService } from '../mail/mail.service';


@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private readonly mailService: MailService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    // 1. Verify and check stock for all products
    for (const item of createOrderDto.items) {
      const product = await this.productModel.findById(item.productId).exec();
      if (!product) {
        throw new NotFoundException(`Product "${item.title}" (ID: ${item.productId}) not found.`);
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for "${item.title}". Available: ${product.stock}, requested: ${item.quantity}.`
        );
      }
    }

    // 2. Decrement stock
    for (const item of createOrderDto.items) {
      await this.productModel.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity }
      }).exec();
    }

    // 3. Create and save order
    const order = new this.orderModel({
      ...createOrderDto,
      paymentStatus: createOrderDto.paymentMethod === 'cod' ? 'unpaid' : 'pending',
      orderStatus: 'placed'
    });

    const savedOrder = await order.save();

    // 4. Send order confirmation email asynchronously
    this.mailService.sendOrderConfirmationEmail(savedOrder.email, savedOrder).catch(err => {
      console.error('Failed to send confirmation email:', err);
    });

    return savedOrder;
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException(`Order with ID "${id}" not found.`);
    }
    return order;
  }

  async findAll(): Promise<Order[]> {
    return this.orderModel.find().sort({ createdAt: -1 }).exec();
  }

  async findByEmail(email: string): Promise<Order[]> {
    return this.orderModel.find({ email }).sort({ createdAt: -1 }).exec();
  }


  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.orderModel.findByIdAndUpdate(
      id,
      { $set: updateOrderDto },
      { new: true }
    ).exec();
    if (!order) {
      throw new NotFoundException(`Order with ID "${id}" not found.`);
    }
    return order;
  }
}

