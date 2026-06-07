import { Module } from '@nestjs/common';
import { JwtCookieGuard } from '../../common/guards/jwt-cookie.guard';
import { AuthModule } from '../auth/auth.module';
import { GroupTripsController } from './group-trips.controller';
import { GroupTripsService } from './group-trips.service';

@Module({
  imports: [AuthModule],
  controllers: [GroupTripsController],
  providers: [GroupTripsService, JwtCookieGuard],
})
export class GroupTripsModule {}
