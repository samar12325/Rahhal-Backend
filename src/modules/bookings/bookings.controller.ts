import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtCookieGuard } from '../../common/guards/jwt-cookie.guard';
import { CheckoutBookingDto } from './dto/checkout-booking.dto';
import { BookingsService } from './bookings.service';

type AuthenticatedRequest = {
  user: {
    userId: string;
  };
};

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @UseGuards(JwtCookieGuard)
  @Post('checkout')
  checkout(@Req() req: AuthenticatedRequest, @Body() dto: CheckoutBookingDto) {
    return this.bookingsService.checkout(req.user.userId, dto);
  }
}
