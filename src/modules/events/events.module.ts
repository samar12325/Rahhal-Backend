import { Module } from '@nestjs/common';
import { JwtCookieGuard } from '../../common/guards/jwt-cookie.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthModule } from '../auth/auth.module';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
  imports: [AuthModule],
  controllers: [EventsController],
  providers: [EventsService, JwtCookieGuard, RolesGuard],
})
export class EventsModule {}
