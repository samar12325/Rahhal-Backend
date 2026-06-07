import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AdminGuard } from '../../common/guards/admin.guard';
import { JwtCookieGuard } from '../../common/guards/jwt-cookie.guard';
import { ContactService } from './contact.service';
import { AdminContactMessagesQueryDto } from './dto/admin-contact-messages-query.dto';
import { CreateContactDto } from './dto/create-contact.dto';
import { ReplyContactMessageDto } from './dto/reply-contact-message.dto';

@Controller()
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post('contact')
  create(@Body() dto: CreateContactDto, @Req() req: Request) {
    return this.contactService.create(dto, {
      ipAddress: req.ip,
      userAgent: req.get('user-agent') ?? null,
    });
  }

  @Get('admin/contact-messages')
  @UseGuards(JwtCookieGuard, AdminGuard)
  list(@Query() query: AdminContactMessagesQueryDto) {
    return this.contactService.list(query);
  }

  @Get('admin/contact-messages/unread-count')
  @UseGuards(JwtCookieGuard, AdminGuard)
  unreadCount() {
    return this.contactService.getUnreadCount();
  }

  @Get('admin/contact-messages/:id')
  @UseGuards(JwtCookieGuard, AdminGuard)
  details(@Param('id', ParseIntPipe) id: number) {
    return this.contactService.getDetails(id);
  }

  @Patch('admin/contact-messages/:id/reply')
  @UseGuards(JwtCookieGuard, AdminGuard)
  reply(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReplyContactMessageDto,
  ) {
    return this.contactService.reply(id, dto);
  }
}
