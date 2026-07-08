import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { envs } from 'src/config/env';
import { randomBytes } from 'crypto';
import { SessionMeta } from './interfaces/session.interface';
import { compareHash, hash } from 'src/common/helpers/bcrypt';

@Injectable()
export class SessionService {
  private readonly refreshTtlMs: number;

  constructor(private readonly prisma: PrismaService) {
    this.refreshTtlMs = envs.REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000;
  }

  private newSecret() {
    return randomBytes(48).toString('base64url');
  }

  async create(userId: string, meta: SessionMeta) {
    const secret = this.newSecret();

    const session = await this.prisma.session.create({
      data: {
        userId,
        refreshToken: hash(secret),
        userAgent: meta.userAgent,
        ipAddress: meta.ipAddress,
        expiresAt: new Date(Date.now() + this.refreshTtlMs),
      },
    });

    return { cookieValue: `${session.id}.${secret}`, session };
  }

  async rotate(cookieValue: string) {
    const parsed = this.parse(cookieValue);
    if (!parsed) throw new UnauthorizedException('Refresh token inválido');

    const { sessionId, secret } = parsed;

    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session || !session.isActive || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Sesión expirada o revocada');
    }

    if (!compareHash(secret, session.refreshToken)) {
      await this.prisma.session.update({
        where: { id: sessionId },
        data: { isActive: false },
      });

      throw new UnauthorizedException(
        'Refresh token reutilizado; sesión revocada',
      );
    }

    const newSecret = this.newSecret();
    const updated = await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        refreshToken: hash(newSecret),
        expiresAt: new Date(Date.now() + this.refreshTtlMs),
      },
    });

    return { cookieValue: `${session.id}.${newSecret}`, session: updated };
  }

  async isActive(sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      select: { isActive: true, expiresAt: true },
    });

    return !!session && session.isActive && session.expiresAt > new Date();
  }

  async revoke(sessionId: string) {
    await this.prisma.session.updateMany({
      where: { id: sessionId },
      data: { isActive: false },
    });
  }

  async revokeAllForUser(userId: string, exceptSessionId?: string) {
    await this.prisma.session.updateMany({
      where: {
        userId,
        ...(exceptSessionId && { id: { not: exceptSessionId } }),
      },
      data: {
        isActive: false,
      },
    });
  }

  async listForUser(userId: string) {
    return this.prisma.session.findMany({
      where: { userId, isActive: true, expiresAt: { gt: new Date() } },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        location: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  private parse(cookieValue: string) {
    const dot = cookieValue.indexOf('.');
    if (dot <= 0 || dot === cookieValue.length - 1) return null;

    return {
      sessionId: cookieValue.slice(0, dot),
      secret: cookieValue.slice(dot + 1),
    };
  }
}
