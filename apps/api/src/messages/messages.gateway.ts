import { WebSocketGateway, SubscribeMessage, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ namespace: '/chat', cors: { origin: true } })
export class MessagesGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join_room')
  handleJoin(_: any) {
    // placeholder
    return { status: 'joined' };
  }
}
