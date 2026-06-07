import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CreateTripDto } from './dto/create-trip.dto';
import { ListTripsDto } from './dto/list-trips.dto';
import { TripsService } from './trips.service';

@Controller('api/trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get()
  list(@Query() q: ListTripsDto) {
    return this.tripsService.list(q);
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.tripsService.getById(id);
  }

  @Post()
  create(@Body() dto: CreateTripDto) {
    return this.tripsService.create(dto);
  }
}
