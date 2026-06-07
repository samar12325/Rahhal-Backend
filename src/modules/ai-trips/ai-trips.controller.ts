import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtCookieGuard } from '../../common/guards/jwt-cookie.guard';
import { AiTripsService } from './ai-trips.service';
import { ChatAiTripDto } from './dto/chat-ai-trip.dto';
import { GenerateAiTripDto } from './dto/generate-ai-trip.dto';

type AuthenticatedRequest = {
  user: {
    userId: string;
  };
};

@UseGuards(JwtCookieGuard)
@Controller('api/ai-trips')
export class AiTripsController {
  constructor(private readonly service: AiTripsService) {}

  @Get()
  list(@Req() req: AuthenticatedRequest) {
    return this.service.listSessions(req.user.userId);
  }

  @Post('generate')
  generate(@Req() req: AuthenticatedRequest, @Body() dto: GenerateAiTripDto) {
    return this.service.generate(req.user.userId, dto);
  }

  @Post('assistant')
  startAssistantSession(
    @Req() req: AuthenticatedRequest,
    @Body() dto: ChatAiTripDto,
  ) {
    return this.service.startAssistantSession(req.user.userId, dto);
  }

  @Post(':id/chat')
  chat(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: ChatAiTripDto,
  ) {
    return this.service.chat(req.user.userId, id, dto);
  }

  @Get(':id')
  getById(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.getSession(req.user.userId, id);
  }
}
