import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminApprovalsController } from './admin-approvals.controller';
import { AdminApprovalsService } from './admin-approvals.service';
import { JwtCookieGuard } from '../../common/guards/jwt-cookie.guard';
import { AdminGuard } from '../../common/guards/admin.guard';

@Module({
  imports: [AuthModule],
  controllers: [AdminApprovalsController],
  providers: [AdminApprovalsService, JwtCookieGuard, AdminGuard],
})
export class AdminApprovalsModule {}
