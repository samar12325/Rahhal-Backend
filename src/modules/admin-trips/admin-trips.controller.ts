import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminTripsService } from './admin-trips.service';
import { AdminTripsQueryDto } from './dto/admin-trips-query.dto';
import { CreateAdminTripDto } from './dto/create-admin-trip.dto';
import { UpdateAdminTripDto } from './dto/update-admin-trip.dto';
import { JwtCookieGuard } from '../../common/guards/jwt-cookie.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin/trips')
@UseGuards(JwtCookieGuard, RolesGuard)
@Roles('admin')
export class AdminTripsController {
  constructor(private readonly adminTripsService: AdminTripsService) {}

  @Get()
  list(@Query() query: AdminTripsQueryDto) {
    return this.adminTripsService.list(query);
  }

  @Post()
  create(@Body() dto: CreateAdminTripDto) {
    return this.adminTripsService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdminTripDto,
  ) {
    return this.adminTripsService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.adminTripsService.delete(id);
  }
}
