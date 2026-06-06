import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.register(dto);
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return { user: result.user };
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.login(dto);
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return { user: result.user };
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return { accessToken: null };
    }

    const result = await this.auth.refresh(token);
    this.setAccessCookie(res, result.accessToken);
    return { ok: true };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken', this.cookieOptions());
    res.clearCookie('refreshToken', this.cookieOptions());
    return { ok: true };
  }

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    this.setAccessCookie(res, accessToken);
    const refreshDays =
      parseInt(process.env.REFRESH_EXPIRES_IN_DAYS ?? '7', 10) || 7;
    res.cookie('refreshToken', refreshToken, {
      ...this.cookieOptions(),
      maxAge: refreshDays * 24 * 60 * 60 * 1000,
    });
  }

  private setAccessCookie(res: Response, accessToken: string) {
    res.cookie('accessToken', accessToken, {
      ...this.cookieOptions(),
      maxAge: 15 * 60 * 1000,
    });
  }

  private cookieOptions() {
    return {
      httpOnly: true,
      secure: false,
      sameSite: 'lax' as const,
      path: '/',
    };
  }
}
