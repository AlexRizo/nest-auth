import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { Workspace } from '@prisma/client';

export const CurrentWorkspace = createParamDecorator(
  (data: keyof Workspace, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const workspace = request.workspace as Workspace;

    return data ? workspace[data] : workspace;
  },
);
