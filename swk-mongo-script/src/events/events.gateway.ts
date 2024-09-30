import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

const WEB_SOCKET_DEFAULT_PORT = 8001;

@WebSocketGateway(
  Number(process.env.WEB_SOCKET_PORT) || WEB_SOCKET_DEFAULT_PORT,
  {
    transports: ['websocket'],
    cors: { origin: '*' },
  },
)
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() private server: Server;
  private logger: Logger = new Logger('WebsocketServer');

  private clients: Map<string, Socket> = new Map();

  afterInit() {
    this.logger.log('Websokcet init...');
  }

  handleConnection(client: Socket) {
    const uid: string = client.handshake.query.uid.toString();
    this.clients.set(uid, client);
  }

  handleDisconnect(client: Socket) {
    const uid: string = client.handshake.query.uid.toString();
    this.clients.delete(uid);
  }

  sendMessage(u: string, msg: string) {
    if (this.clients.has(u)) {
      this.clients.get(u).emit('log', msg);
    }
  }

  getClient(u: string): Socket {
    if (this.clients.has(u)) {
      return this.clients.get(u);
    }
  }
}
