import { Module } from '@nestjs/common';
import { JwtCookieGuard } from '../../common/guards/jwt-cookie.guard';
import { AuthModule } from '../auth/auth.module';
import { SchoolTripsController } from './school-trips.controller';
import { SchoolTripsService } from './school-trips.service';

@Module({
  imports: [AuthModule],
  controllers: [SchoolTripsController],
  providers: [SchoolTripsService, JwtCookieGuard],
})
export class SchoolTripsModule {}
