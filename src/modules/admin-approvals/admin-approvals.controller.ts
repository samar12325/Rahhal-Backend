import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminApprovalsService } from './admin-approvals.service';
import { AdminApprovalsQueryDto } from './dto/admin-approvals-query.dto';
import { RejectApprovalDto } from './dto/reject-approval.dto';
import { JwtCookieGuard } from '../../common/guards/jwt-cookie.guard';
import { AdminGuard } from '../../common/guards/admin.guard';

@Controller('admin/approvals')
@UseGuards(JwtCookieGuard)
export class AdminApprovalsController {
  constructor(private readonly service: AdminApprovalsService) {}

  @Get()
  list(
    @Query() query: AdminApprovalsQueryDto,
    @Req() req?: { user?: { userId?: string; role?: string } },
  ) {
    return this.service.list(query, {
      userId: req?.user?.userId ?? '',
      role: req?.user?.role ?? '',
    });
  }

  @Patch(':id/approve')
  @UseGuards(AdminGuard)
  approve(
    @Param('id', ParseIntPipe) id: number,
    @Req() req?: { user?: { userId?: string } },
  ) {
    const reviewerId = Number(req?.user?.userId ?? 0);
    return this.service.approve(id, reviewerId);
  }

  @Patch(':id/reject')
  @UseGuards(AdminGuard)
  reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectApprovalDto,
    @Req() req?: { user?: { userId?: string } },
  ) {
    const reviewerId = Number(req?.user?.userId ?? 0);
    return this.service.reject(id, reviewerId, dto.reason);
  }
}
