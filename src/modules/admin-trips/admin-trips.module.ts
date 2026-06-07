import { Module } from '@nestjs/common';
import { AdminTripsController } from './admin-trips.controller';
import { AdminTripsService } from './admin-trips.service';
import { AuthModule } from '../auth/auth.module';
import { JwtCookieGuard } from '../../common/guards/jwt-cookie.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
  imports: [AuthModule],
  controllers: [AdminTripsController],
  providers: [AdminTripsService, JwtCookieGuard, RolesGuard],
})
export class AdminTripsModule {}
