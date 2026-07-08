import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { generateSecret, generateURI, verify } from 'otplib';
import { toDataURL } from 'qrcode';

@Injectable()
export class TwoFactorService {
  private readonly appName: string;

  constructor(private readonly prisma: PrismaService) {
    this.appName = 'MiApp';
  }

  async generateSecret(userId: string, email: string) {
    const secret = generateSecret();

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret,
        twoFactorEnabled: true,
      },
    });

    const otpauthUrl = generateURI({
      issuer: this.appName,
      label: email,
      secret,
    });

    const qrCodeDataUrl = await toDataURL(otpauthUrl);

    return { secret, otpauthUrl, qrCodeDataUrl };
  }

  async enable(userId: string, code: string) {
    const user = await this.prisma.user.findFirstOrThrow({
      where: {
        id: userId,
      },
      select: { twoFactorSecret: true, twoFactorEnabled: true },
    });

    if (user.twoFactorEnabled) {
      throw new BadRequestException('El 2FA está habilitado');
    }

    if (!user.twoFactorSecret) {
      throw new BadRequestException(
        'Hay que generar el secreto (POST /api/v1/auth/2fa/setup)',
      );
    }

    const checkUser = await this.check(user.twoFactorSecret, code);

    if (!checkUser) throw new BadRequestException('Código inválido');

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
      },
    });
  }

  async disable(userId: string, code: string) {
    const valid = await this.verify(userId, code);

    if (!valid) throw new BadRequestException('Código inválido');

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });
  }

  async verify(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        twoFactorSecret: true,
        twoFactorEnabled: true,
      },
    });

    if (!user?.twoFactorEnabled || !user.twoFactorSecret) return false;
    return this.check(user.twoFactorSecret, code);
  }

  private async check(secret: string, token: string) {
    const result = await verify({ secret, token, epochTolerance: 30 });
    return result.valid;
  }
}
