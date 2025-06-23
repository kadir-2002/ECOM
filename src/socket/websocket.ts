import { WebSocketServer, WebSocket } from 'ws';
import { verifyToken } from '../utils/jwt';

let wss: WebSocketServer;
const clients = new Map<number, WebSocket>();

export const initWebSocket = (server: any) => {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket, req: any) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const token = url.searchParams.get('token');

      if (!token) {
        ws.close(1008, 'Unauthorized: Token missing');
        return;
      }

      const payload = verifyToken(token); // ✅ Same as HTTP auth

      const userId = payload.userId;
      clients.set(userId, ws);
      console.log(`✅ WebSocket connected for user ${userId}`);

      ws.on('close', () => {
        clients.delete(userId);
        console.log(`🔌 WebSocket disconnected for user ${userId}`);
      });

      ws.on('error', (err) => {
        console.error(`❌ WebSocket error for user ${userId}:`, err);
        clients.delete(userId);
      });

    } catch (err) {
      console.error('❌ WebSocket auth failed:', err);
      ws.close(1008, 'Unauthorized: Invalid token');
    }
  });
};

export const notifyUpdate = (userId: number, message: any) => {
  const client = clients.get(userId);
  if (client && client.readyState === client.OPEN) {
    client.send(JSON.stringify(message));
  }
};