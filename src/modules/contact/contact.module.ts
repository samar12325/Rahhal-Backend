import { Module } from '@nestjs/common';
import { AdminGuard } from '../../common/guards/admin.guard';
import { JwtCookieGuard } from '../../common/guards/jwt-cookie.guard';
import { AuthModule } from '../auth/auth.module';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';

@Module({
  imports: [AuthModule],
  controllers: [ContactController],
  providers: [ContactService, JwtCookieGuard, AdminGuard],
})
export class ContactModule {}
