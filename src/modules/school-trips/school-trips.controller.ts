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
  Req,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, memoryStorage } from 'multer';
import type { Express } from 'express';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { JwtCookieGuard } from '../../common/guards/jwt-cookie.guard';
import {
  CreateParentApprovalDto,
  UpdateParentApprovalStatusDto,
} from './dto/create-parent-approval.dto';
import { CreateSchoolTripDto } from './dto/create-school-trip.dto';
import {
  SendAllParentApprovalsDto,
  UploadParentApprovalsDto,
} from './dto/upload-parent-approvals.dto';
import {
  UpdateSchoolTripLiveStatusDto,
  UpdateStudentAttendanceDto,
} from './dto/update-school-trip-preparation.dto';
import { SchoolTripsService } from './school-trips.service';
import type { RequestWithAuthCookies } from '../../common/types/authenticated-request.type';

const permitsDir = join(process.cwd(), 'uploads', 'permits');

function ensurePermitsDir() {
  if (!existsSync(permitsDir)) {
    mkdirSync(permitsDir, { recursive: true });
  }
}

function filename(
  _: unknown,
  file: Express.Multer.File,
  cb: (error: Error | null, filename: string) => void,
) {
  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  cb(null, `permit-${unique}${extname(file.originalname)}`);
}

@Controller(['api/school-trips', 'trip'])
export class SchoolTripsController {
  constructor(private readonly service: SchoolTripsService) {}

  @Post()
  @UseGuards(JwtCookieGuard)
  @UseInterceptors(
    FileInterceptor('permitFile', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          ensurePermitsDir();
          cb(null, permitsDir);
        },
        filename,
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  create(
    @Body() dto: CreateSchoolTripDto,
    @UploadedFile() file?: Express.Multer.File,
    @Req() req?: RequestWithAuthCookies,
  ) {
    const permitFileUrl = file ? `/uploads/permits/${file.filename}` : null;
    const createdBy = Number(req?.user?.userId ?? 0);
    return this.service.create(dto, createdBy, permitFileUrl);
  }

  @Post('upload-excel')
  @UseGuards(JwtCookieGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadExcel(
    @Body() dto: UploadParentApprovalsDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() req?: RequestWithAuthCookies,
  ) {
    return this.service.uploadParentApprovalsFile(file, dto.tripId, {
      userId: req?.user?.userId,
      role: req?.user?.role,
    });
  }

  @Post('send-all')
  @UseGuards(JwtCookieGuard)
  sendAll(
    @Body() dto: SendAllParentApprovalsDto,
    @Req() req?: RequestWithAuthCookies,
  ) {
    return this.service.sendAllParentApprovals(dto, {
      userId: req?.user?.userId,
      role: req?.user?.role,
    });
  }

  @Get('stats')
  @UseGuards(JwtCookieGuard)
  getStats(@Req() req?: RequestWithAuthCookies) {
    return this.service.getStats({
      userId: req?.user?.userId,
      role: req?.user?.role,
    });
  }

  @Get('regions')
  listRegions() {
    return this.service.listRegions();
  }

  @Get('cities')
  listCities(@Query('region') region: string) {
    return this.service.listCities(region);
  }

  @Get('places')
  listPlaces(@Query('destinationId') destinationId: string) {
    return this.service.listPlaces(destinationId);
  }

  @Get('parent-approvals')
  listParentApprovals(@Query('trip_id') tripId?: string) {
    return this.service.listParentApprovals(tripId);
  }

  @Post('parent-approvals')
  createParentApproval(@Body() dto: CreateParentApprovalDto) {
    return this.service.createParentApproval(dto);
  }

  @Get('parent-approvals/token/:token')
  getParentApprovalByToken(@Param('token') token: string) {
    return this.service.getParentApprovalByToken(token);
  }

  @Patch('parent-approvals/token/:token')
  updateParentApprovalStatus(
    @Param('token') token: string,
    @Body() dto: UpdateParentApprovalStatusDto,
  ) {
    return this.service.updateParentApprovalStatus(token, dto.approvalStatus);
  }

  @Delete('parent-approvals/:id')
  deleteParentApproval(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteParentApproval(id);
  }

  @Patch(':tripId/confirm-prep')
  @UseGuards(JwtCookieGuard)
  confirmPrep(
    @Param('tripId', ParseIntPipe) tripId: number,
    @Req() req?: RequestWithAuthCookies,
  ) {
    return this.service.confirmPrep(tripId, {
      userId: req?.user?.userId,
      role: req?.user?.role,
    });
  }

  @Get(':tripId/preparation')
  @UseGuards(JwtCookieGuard)
  getPreparation(
    @Param('tripId', ParseIntPipe) tripId: number,
    @Req() req?: RequestWithAuthCookies,
  ) {
    return this.service.getPreparation(tripId, {
      userId: req?.user?.userId,
      role: req?.user?.role,
    });
  }

  @Patch(':tripId/preparation/status')
  @UseGuards(JwtCookieGuard)
  updateTripLiveStatus(
    @Param('tripId', ParseIntPipe) tripId: number,
    @Body() dto: UpdateSchoolTripLiveStatusDto,
    @Req() req?: RequestWithAuthCookies,
  ) {
    return this.service.updateTripLiveStatus(tripId, dto, {
      userId: req?.user?.userId,
      role: req?.user?.role,
    });
  }

  @Post(':tripId/preparation/send-tracking-links')
  @UseGuards(JwtCookieGuard)
  sendTrackingLinks(
    @Param('tripId', ParseIntPipe) tripId: number,
    @Req() req?: RequestWithAuthCookies,
  ) {
    return this.service.sendTrackingLinks(tripId, {
      userId: req?.user?.userId,
      role: req?.user?.role,
    });
  }

  @Patch(':tripId/preparation/students/:approvalId')
  @UseGuards(JwtCookieGuard)
  updateStudentAttendance(
    @Param('tripId', ParseIntPipe) tripId: number,
    @Param('approvalId', ParseIntPipe) approvalId: number,
    @Body() dto: UpdateStudentAttendanceDto,
    @Req() req?: RequestWithAuthCookies,
  ) {
    return this.service.updateStudentAttendance(tripId, approvalId, dto, {
      userId: req?.user?.userId,
      role: req?.user?.role,
    });
  }

  @Get(':tripId/report')
  @UseGuards(JwtCookieGuard)
  getTripReport(
    @Param('tripId', ParseIntPipe) tripId: number,
    @Req() req?: RequestWithAuthCookies,
  ) {
    return this.service.getTripReport(tripId, {
      userId: req?.user?.userId,
      role: req?.user?.role,
    });
  }

  @Get(':id')
  @UseGuards(JwtCookieGuard)
  getById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req?: RequestWithAuthCookies,
  ) {
    return this.service.getById(id, {
      userId: req?.user?.userId,
      role: req?.user?.role,
    });
  }

  @Get()
  @UseGuards(JwtCookieGuard)
  list(@Req() req?: RequestWithAuthCookies) {
    return this.service.list({
      userId: req?.user?.userId,
      role: req?.user?.role,
    });
  }

  @Get('tracking/:token')
  getTrackingByToken(@Param('token') token: string) {
    return this.service.getTrackingByToken(token);
  }
}
