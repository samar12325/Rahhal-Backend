import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtCookieGuard } from '../../common/guards/jwt-cookie.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller()
export class UsersController {
  constructor(private users: UsersService) {}

  @UseGuards(JwtCookieGuard)
  @Get('me')
  me(@Req() req: any) {
    return this.users.getMe(req.user.userId);
  }

  @UseGuards(JwtCookieGuard)
  @Patch('me')
  update(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.users.updateMe(req.user.userId, dto);
  }
}
