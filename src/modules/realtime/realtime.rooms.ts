// Un room de Socket.IO por Space: todo evento en tiempo real está acotado
// al Space donde ocurre (asignaciones, cambios de status de tareas, etc.).
export const spaceRoom = (spaceId: string) => `space:${spaceId}`;

// Un room personal por usuario, unido automáticamente al autenticar (no
// requiere join explícito del cliente). Se usa para todo lo cuya
// visibilidad depende del usuario y no es uniforme para todo el Space
// (cambios de tareas según mineFilter, notificaciones, etc.) — ver
// tasks.service.ts `visibilityFilter`/`mineFilter`.
export const userRoom = (userId: string) => `user:${userId}`;
