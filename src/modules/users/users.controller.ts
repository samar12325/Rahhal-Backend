import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtCookieGuard } from '../../common/guards/jwt-cookie.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import type { AuthenticatedRequest } from '../../common/types/authenticated-request.type';

@Controller()
export class UsersController {
  constructor(private users: UsersService) {}

  @UseGuards(JwtCookieGuard)
  @Get('me')
  me(@Req() req: AuthenticatedRequest) {
    return this.users.getMe(req.user.userId);
  }

  @UseGuards(JwtCookieGuard)
  @Patch('me')
  update(@Req() req: AuthenticatedRequest, @Body() dto: UpdateProfileDto) {
    return this.users.updateMe(req.user.userId, dto);
  }

  @UseGuards(JwtCookieGuard)
  @Get('me/bookings')
  myBookings(@Req() req: AuthenticatedRequest) {
    return this.users.getMyBookings(req.user.userId);
  }
}
