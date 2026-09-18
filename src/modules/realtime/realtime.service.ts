import { Injectable } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { AssignmentsUpdatedPayload, REALTIME_EVENTS } from './realtime.events';
import { spaceRoom, userRoom } from './realtime.rooms';

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

  /** Emite solo a las pestañas/dispositivos de un usuario puntual (su sala
   * personal). Base para eventos cuya visibilidad depende del usuario y no
   * es uniforme para todo el Space: cambios de tareas filtrados por
   * mineFilter, notificaciones, etc. */
  emitToUser(userId: string, event: string, payload: unknown) {
    this.gateway.server.to(userRoom(userId)).emit(event, payload);
  }
}
