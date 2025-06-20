import { WebSocketServer, WebSocket } from 'ws';

let wss: WebSocketServer;

const clients = new Map<number, WebSocket>(); // Map userId to socket

export const initWebSocket = (server: any) => {
    wss = new WebSocketServer({ server });

    wss.on('connection', (ws: WebSocket, req: any) => {
        const userId = parseInt(req.url?.split('?userId=')[1] || '0');
        if (userId) clients.set(userId, ws);

        ws.on('close', () => {
            clients.delete(userId);
        });
    });
}

export const notifyOrderUpdate = (userId: number, message: any) => {
  const client = clients.get(userId);
  if (client && client.readyState === client.OPEN) {
    client.send(JSON.stringify(message));
  }
};