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
import { JwtCookieGuard } from '../../common/guards/jwt-cookie.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateEventDto } from './dto/create-event.dto';
import { DeleteEventDto } from './dto/delete-event.dto';
import { ListEventsDto } from './dto/list-events.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventsService } from './events.service';

@Controller()
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get('events')
  list(@Query() query: ListEventsDto) {
    return this.eventsService.list(query, false);
  }

  @Get('events/:id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.getById(id, false);
  }

  @Get('admin/events')
  @UseGuards(JwtCookieGuard, RolesGuard)
  @Roles('admin')
  adminList(@Query() query: ListEventsDto) {
    return this.eventsService.list(query, true);
  }

  @Post('admin/events')
  @UseGuards(JwtCookieGuard, RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreateEventDto) {
    return this.eventsService.create(dto);
  }

  @Patch('admin/events/:id')
  @UseGuards(JwtCookieGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEventDto) {
    return this.eventsService.update(id, dto);
  }

  @Delete('admin/events/:id')
  @UseGuards(JwtCookieGuard, RolesGuard)
  @Roles('admin')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: DeleteEventDto,
  ) {
    return this.eventsService.remove(id, query);
  }
}
