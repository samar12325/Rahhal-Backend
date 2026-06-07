import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtCookieGuard } from '../common/guards/jwt-cookie.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { StatsRange, StatsRangeDto } from './dto/stats-range.dto';
import { StatsService } from './stats.service';

@UseGuards(JwtCookieGuard, RolesGuard)
@Roles('admin')
@Controller()
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('dashboard/trip-stats')
  getTripStats(@Query() query: StatsRangeDto) {
    const range = query.range ?? StatsRange.MONTH;
    return this.statsService.getDashboard(range);
  }

  @Get('admin/stats/dashboard')
  getLegacyDashboard(@Query() query: StatsRangeDto) {
    const range = query.range ?? StatsRange.MONTH;
    return this.statsService.getDashboard(range);
  }
}
