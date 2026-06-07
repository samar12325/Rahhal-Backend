import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtCookieGuard } from '../../common/guards/jwt-cookie.guard';
import type { AuthenticatedRequest } from '../../common/types/authenticated-request.type';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private service: ReviewsService) {}

  @Get()
  list(@Query('limit') limit: string) {
    return this.service.list(Number(limit) || 6);
  }

  @UseGuards(JwtCookieGuard)
  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateReviewDto) {
    return this.service.create(req.user.userId, dto);
  }
}
