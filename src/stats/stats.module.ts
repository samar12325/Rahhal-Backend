import { Module } from '@nestjs/common';
import { JwtCookieGuard } from '../common/guards/jwt-cookie.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuthModule } from '../modules/auth/auth.module';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [AuthModule],
  controllers: [StatsController],
  providers: [StatsService, JwtCookieGuard, RolesGuard],
})
export class StatsModule {}
