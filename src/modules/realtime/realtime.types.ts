import type { DefaultEventsMap, Socket } from 'socket.io';
import type { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';

// Socket.IO tipa `socket.data` con el 4º type param de `Socket<...>`, no con
// declaration merging; por default es `any`, de ahí que TS no supiera qué
// era `client.data.user`. Este alias es el que hay que usar en vez del
// `Socket` genérico en cualquier lugar del gateway.
export interface SocketData {
  // Ausente hasta que handleConnection termina de autenticar; si falla, el
  // socket se desconecta antes de que cualquier otro handler pueda correr.
  user?: AuthenticatedUser;
}

// Los primeros 3 type params (listen/emit/server-side events) se dejan como
// DefaultEventsMap: aún no tenemos un mapa de eventos tipado y no es el
// problema que estamos resolviendo. Lo que sí tipamos es `data` (4º param),
// que es lo que causaba el `any` en `client.data.user`.
export type AppSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  SocketData
>;
