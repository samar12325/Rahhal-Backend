import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { DestinationsService } from './destinations.service';

@Controller('destinations')
export class DestinationsController {
  constructor(private service: DestinationsService) {}

  @Get()
  list(@Query('region') region = 'all') {
    return this.service.list(region);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const destination = await this.service.getById(id);
    if (!destination) {
      throw new NotFoundException('Destination not found');
    }
    return destination;
  }
}
