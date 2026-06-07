import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { JwtCookieGuard } from '../../common/guards/jwt-cookie.guard';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

@Module({
  imports: [AuthModule],
  controllers: [BookingsController],
  providers: [BookingsService, JwtCookieGuard],
})
export class BookingsModule {}
