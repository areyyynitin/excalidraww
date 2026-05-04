import { io, Socket } from 'socket.io-client';

const socket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
    transports: ['websocket'],
});

export default socket;
