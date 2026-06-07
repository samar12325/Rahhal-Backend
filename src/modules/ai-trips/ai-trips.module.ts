import { Module } from '@nestjs/common';
import { JwtCookieGuard } from '../../common/guards/jwt-cookie.guard';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AiTripsController } from './ai-trips.controller';
import { AiTripsService } from './ai-trips.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AiTripsController],
  providers: [AiTripsService, JwtCookieGuard],
})
export class AiTripsModule {}
