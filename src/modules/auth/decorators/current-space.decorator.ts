import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { Space } from '@prisma/client';

export const CurrentSpace = createParamDecorator(
  (data: keyof Space, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const space = request.space as Space;

    return data ? space[data] : space;
  },
);
