// Nombres de eventos compartidos entre el gateway y los servicios que
// emiten cambios (p. ej. AssignmentsService). Centralizados para que
// backend y frontend no diverjan en el nombre del string.
export const REALTIME_EVENTS = {
  ASSIGNMENTS_UPDATED: 'assignments:updated',
} as const;

export interface AssignmentsUpdatedPayload {
  spaceId: string;
  taskIds: string[];
  actorUserId: string;
}
