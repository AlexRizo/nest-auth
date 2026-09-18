import { Injectable } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { AssignmentsUpdatedPayload, REALTIME_EVENTS } from './realtime.events';
import { spaceRoom } from './realtime.rooms';

// Fachada que usan otros módulos (AssignmentsService, TasksService, ...)
// para emitir sin acoplarse a Socket.IO ni a la sala directamente.
@Injectable()
export class RealtimeService {
  constructor(private readonly gateway: RealtimeGateway) {}

  emitAssignmentsUpdated(payload: AssignmentsUpdatedPayload) {
    this.gateway.server
      .to(spaceRoom(payload.spaceId))
      .emit(REALTIME_EVENTS.ASSIGNMENTS_UPDATED, payload);
  }
}
