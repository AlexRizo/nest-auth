import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  Get,
  Delete,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { RegisterUserDto } from './dto/register-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import type { Request, Response } from 'express';
import { User } from '@prisma/client';
import { TwoFactorPendingGuard } from './guards/two-factor-pending.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { type AuthenticatedUser } from './interfaces/jwt-payload.interface';
import { TwoFactorCodeDto } from './dto/two-factor-code.dto';
import { SessionService } from './session.service';
import { TwoFactorService } from './two-factor.service';
import { UsersService } from '../users/users.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { envs } from 'src/config/env';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
    private readonly twoFactorService: TwoFactorService,
    private readonly userService: UsersService,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    const user = await this.authService.register(dto);
    return this.authService.toPublicUser(user);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Req() req: Request, @Res() res: Response) {
    return this.authService.login(req.user as User, req, res);
  }

  @Public()
  @UseGuards(TwoFactorPendingGuard)
  @HttpCode(HttpStatus.OK)
  @Post('2fa/login')
  async twoFactorLogin(
    @CurrentUser() partial: AuthenticatedUser,
    @Req() req: Request,
    @Res() res: Response,
    @Body() dto: TwoFactorCodeDto,
  ) {
    const valid = await this.twoFactorService.verify(partial.id, dto.code);
    if (!valid) {
      return { twoFactorRequired: true, error: 'Código Inválido' };
    }

    const user = await this.userService.findOne(partial.id);
    return this.authService.establishSession(user, req, res);
  }

  @HttpCode(HttpStatus.OK)
  @Post('2fa/enable')
  async enableTwoFactor(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: TwoFactorCodeDto,
  ) {
    await this.twoFactorService.enable(user.id, dto.code);
    // Buenas prácticas: al activar 2FA se cierran las demás sesiones
    await this.sessionService.revokeAllForUser(user.id, user.sessionId);
    return { enabled: true };
  }

  @HttpCode(HttpStatus.OK)
  @Post('2fa/disable')
  async disableTwoFactor(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: TwoFactorCodeDto,
  ) {
    await this.twoFactorService.disable(user.id, dto.code);
    return { enabled: false };
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  googleAuth(): void {}

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.login(req.user as User, req, res);
    const frontend = envs.FRONTEND_URL;
    // Si el usuario tiene 2FA, el frontend debe pedir el código
    res.redirect(
      result.twoFactorRequired ? `${frontend}/login/2fa` : `${frontend}/`,
    );
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.refresh(req, res);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.logout(user.sessionId, user.jti, res);
  }

  @Get('me')
  async me(@CurrentUser() user: AuthenticatedUser) {
    const full = await this.userService.findOne(user.id);
    return this.authService.toPublicUser(full);
  }

  @Get('sessions')
  listSessions(@CurrentUser() user: AuthenticatedUser) {
    return this.sessionService.listForUser(user.id);
  }

  @Delete('sessions/:id')
  async revokeSession(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) sessionId: string,
  ) {
    const owned = await this.sessionService.findFirst(sessionId, user.id);
    if (owned) await this.sessionService.revoke(sessionId);
    return { success: true };
  }

  @HttpCode(HttpStatus.OK)
  @Post('sessions/revoke-others')
  async revokeOtherSessions(@CurrentUser() user: AuthenticatedUser) {
    await this.sessionService.revokeAllForUser(user.id, user.sessionId);
    return { success: true };
  }
}
