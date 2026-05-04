import { createServer } from 'http';
import { Server } from 'socket.io';
import { setupSocketHandlers } from './socket';
import { startPersistenceTask } from './cache';

const port = process.env.PORT || 3001;
const httpServer = createServer();

const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

startPersistenceTask();
setupSocketHandlers(io);

httpServer.listen(port, () => {
    console.log(`>>> Real-time server running on http://localhost:${port}`);
});
