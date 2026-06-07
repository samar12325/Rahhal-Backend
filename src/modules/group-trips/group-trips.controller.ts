import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Express, Request } from 'express';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { JwtCookieGuard } from '../../common/guards/jwt-cookie.guard';
import { CreateGroupTripDto } from './dto/create-group-trip.dto';
import { ListGroupTripsDto } from './dto/list-group-trips.dto';
import { GroupTripsService } from './group-trips.service';

const groupTripImagesDir = join(process.cwd(), 'uploads', 'group-trips');
const fallbackImageUrl = 'https://placehold.co/640x360?text=Rahhal+Trip';

function ensureGroupTripImagesDir() {
  if (!existsSync(groupTripImagesDir)) {
    mkdirSync(groupTripImagesDir, { recursive: true });
  }
}

function filename(
  _: unknown,
  file: Express.Multer.File,
  cb: (error: Error | null, filename: string) => void,
) {
  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  cb(null, `group-trip-${unique}${extname(file.originalname) || '.png'}`);
}

@Controller('api/group-trips')
export class GroupTripsController {
  constructor(private readonly service: GroupTripsService) {}

  private getApiBaseUrl(req?: Request) {
    const forwardedProto = req?.headers?.['x-forwarded-proto'];
    const protocol =
      (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto) ||
      req?.protocol ||
      'http';
    const host = req?.get?.('host') || `localhost:${process.env.PORT || 3000}`;

    return `${protocol}://${host}`.replace(/\/$/, '');
  }

  private buildPublicUrl(req: Request | undefined, path: string) {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.getApiBaseUrl(req)}${normalizedPath}`;
  }

  private getDefaultImageUrl() {
    return fallbackImageUrl;
  }

  @Get()
  list(@Query() q: ListGroupTripsDto) {
    return this.service.list(q);
  }

  @Get('available')
  listAvailable(@Query() q: ListGroupTripsDto) {
    return this.service.listAvailable(q);
  }

  @Get('past')
  listPast(@Query() q: ListGroupTripsDto) {
    return this.service.listPast(q);
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.service.getById(id);
  }

  @Get(':id/participants')
  @UseGuards(JwtCookieGuard)
  getParticipants(
    @Param('id', ParseIntPipe) id: number,
    @Req()
    req?: Request & { user?: { userId?: string | number; role?: string } },
  ) {
    return this.service.getParticipants(id, {
      userId: req?.user?.userId,
      role: req?.user?.role,
    });
  }

  @Post()
  @UseGuards(JwtCookieGuard)
  @UseInterceptors(
    FileInterceptor('imageFile', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          ensureGroupTripImagesDir();
          cb(null, groupTripImagesDir);
        },
        filename,
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  create(
    @Body() dto: CreateGroupTripDto,
    @UploadedFile() file?: Express.Multer.File,
    @Req() req?: Request & { user?: { userId?: string | number } },
  ) {
    const createdBy = Number(req?.user?.userId ?? 0);
    const uploadedImageUrl = file
      ? this.buildPublicUrl(req, `/uploads/group-trips/${file.filename}`)
      : null;

    return this.service.create(
      dto,
      createdBy,
      uploadedImageUrl,
      this.getDefaultImageUrl(),
    );
  }
}
