import app from './app';
import { createServer } from 'http';
import { initWebSocket } from './socket/websocket';

const PORT = process.env.PORT || 5000;
const server = createServer(app);

initWebSocket(server);

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});