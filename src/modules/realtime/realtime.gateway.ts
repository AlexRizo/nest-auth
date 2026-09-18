import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { envs } from 'src/config/env';
import { SpaceAccessService } from '../spaces/space-access.service';
import { RealtimeAuthService } from './realtime-auth.service';
import { spaceRoom, userRoom } from './realtime.rooms';
import type { AppSocket } from './realtime.types';

interface SpaceRoomPayload {
  workspaceCode: string;
  spaceCode: string;
}

// Gateway único para todo el realtime de la app: los distintos features
// (asignaciones, tasks, etc.) no declaran su propio gateway, solo emiten a
// través de RealtimeService usando las salas por Space que este define.
@WebSocketGateway({
  namespace: '/realtime',
  cors: { origin: envs.ALLOWED_ORIGINS, credentials: true },
})
export class RealtimeGateway implements OnGatewayConnection {
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly realtimeAuth: RealtimeAuthService,
    private readonly spaceAccess: SpaceAccessService,
  ) {}

  // La cookie httpOnly del access token viaja sola en el handshake (mismo
  // dominio/credentials que el REST); no hay forma de mandarla por query
  // sin exponerla en logs, así que autenticamos leyendo el header crudo.
  async handleConnection(client: AppSocket) {
    try {
      const user = await this.realtimeAuth.authenticate(
        client.handshake.headers.cookie,
      );
      client.data.user = user;
      // Sala personal: no depende de en qué workspace/space esté parado el
      // usuario, así que se une sola al autenticar (a diferencia de las
      // salas de space, que el cliente pide explícitamente con space:join).
      await client.join(userRoom(user.id));
    } catch (error) {
      this.logger.debug(`Conexión rechazada: ${(error as Error).message}`);
      client.emit('auth:error', 'No autorizado');
      client.disconnect(true);
    }
  }

  @SubscribeMessage('space:join')
  async onJoinSpace(
    @ConnectedSocket() client: AppSocket,
    @MessageBody() payload: SpaceRoomPayload,
  ) {
    const space = await this.resolveAccessibleSpace(client, payload);
    if (!space) return;

    await client.join(spaceRoom(space.id));
  }

  @SubscribeMessage('space:leave')
  async onLeaveSpace(
    @ConnectedSocket() client: AppSocket,
    @MessageBody() payload: SpaceRoomPayload,
  ) {
    const space = await this.resolveAccessibleSpace(client, payload);
    if (!space) return;

    await client.leave(spaceRoom(space.id));
  }

  private async resolveAccessibleSpace(
    client: AppSocket,
    payload: SpaceRoomPayload,
  ) {
    const user = client.data.user;
    if (!user || !payload?.workspaceCode || !payload?.spaceCode) return null;

    return this.spaceAccess.resolveAccessibleSpace(
      user,
      payload.workspaceCode,
      payload.spaceCode,
    );
  }
}
