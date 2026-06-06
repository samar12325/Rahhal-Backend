import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { JwtCookieGuard } from '../../common/guards/jwt-cookie.guard';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [AuthModule],
  controllers: [UsersController],
  providers: [UsersService, JwtCookieGuard],
})
export class UsersModule {}
