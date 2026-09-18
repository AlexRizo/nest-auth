import type { TaskStatusEnum } from '@prisma/client';

// Nombres de eventos compartidos entre el gateway y los servicios que
// emiten cambios (p. ej. AssignmentsService, TasksService). Centralizados
// para que backend y frontend no diverjan en el nombre del string.
export const REALTIME_EVENTS = {
  ASSIGNMENTS_UPDATED: 'assignments:updated',
  TASK_STATUS_UPDATED: 'task:status-updated',
} as const;

export interface AssignmentsUpdatedPayload {
  spaceId: string;
  taskIds: string[];
  actorUserId: string;
}

// Emitido solo a los destinatarios de TasksService.recipientsFor (no a todo
// el space): el set de gente que puede ver la tarea no cambia con el
// status, así que basta con parchear en el cliente sin mandar la tarea
// completa.
export interface TaskStatusUpdatedPayload {
  taskId: string;
  spaceId: string;
  status: TaskStatusEnum;
  updatedAt: string;
}
