// Un room de Socket.IO por Space: todo evento en tiempo real está acotado
// al Space donde ocurre (asignaciones, cambios de status de tareas, etc.).
export const spaceRoom = (spaceId: string) => `space:${spaceId}`;
