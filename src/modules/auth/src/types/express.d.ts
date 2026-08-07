import { Workspace, Space } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      workspace?: Workspace;
      space?: Space;
    }
  }
}

export {};
