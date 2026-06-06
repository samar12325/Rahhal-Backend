import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { JwtCookieGuard } from '../../common/guards/jwt-cookie.guard';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
  imports: [AuthModule],
  controllers: [ReviewsController],
  providers: [ReviewsService, JwtCookieGuard],
})
export class ReviewsModule {}
