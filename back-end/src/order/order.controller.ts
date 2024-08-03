import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { OrderService } from './service/order.service';
import { CreateOrderDto } from './dto/CreateOrder.dto';
import { CreateCartDto } from 'src/cart/dto/CreateCart.dto';
import { ShippingInfo } from './schema/order.shema';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get(':orderId')
  getOrderById(@Param('orderId') orderId: string) {
    console.log("orderId :",orderId);
    
    return this.orderService.getOrderById(orderId);
  }

  @Post('')
  CreateOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.createOrder(createOrderDto);
  }

  @Put('/:orderId/status')
  updateStatus(
    @Param('orderId') orderId: string,
    @Body('paymentMethod') paymentMethod: string,
  ) {
    return this.orderService.updatePaymentStatus(orderId, paymentMethod);
  }
  @Put('/:orderId/shipping-info')
  updateShippingInfo(@Param('orderId') orderId: string, @Body() data: any) {
    return this.orderService.updateShippingInfo(orderId, data);
  }

  @Put('/:orderId/shipping-status')
  updateShippingStatus(
    @Param('orderId') orderId: string,
    @Body('shippingStatus') shippingStatus: string,
  ) {
    return this.orderService.updateShippingStatus(orderId, shippingStatus);
  }
}
