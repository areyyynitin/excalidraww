import { Server, Socket } from 'socket.io';
import { prisma } from "@repo/db/client";
import { roomCache, dirtyRooms } from './cache';

const userColors = new Map<string, string>();
const colors = ['#f87171', '#fb923c', '#fbbf24', '#facc15', '#a3e635', '#4ade80', '#34d399', '#2dd4bf', '#22d3ee', '#38bdf8', '#60a5fa', '#818cf8', '#a78bfa', '#c084fc', '#e879f9', '#f472b6', '#fb7185'];

export function setupSocketHandlers(io: Server) {
    io.on('connection', (socket: Socket) => {
        console.log(`User connected: ${socket.id}`);
        const color = colors[Math.floor(Math.random() * colors.length)] || '#6366f1';
        userColors.set(socket.id, color);

        socket.on('join-room', async (data) => {
            const roomId = typeof data === 'string' ? data : data.roomId;
            const key = typeof data === 'string' ? null : data.key;

            socket.join(roomId);
            const roomUsers = io.sockets.adapter.rooms.get(roomId);
            io.to(roomId).emit('room:users', roomUsers?.size || 0);

            try {
                const room = await prisma.room.findUnique({ where: { id: roomId } });
                
                // Determine if user can edit
                // If room doesn't exist, allow editing for now (it will be created on first save)
                // In a real production app, you'd want more strict creation logic
                let canEdit = true;
                if (room) {
                    // @ts-ignore - we'll add editKey to schema
                    if (room.editKey && room.editKey !== key) {
                        canEdit = false;
                    }
                }
                (socket as any).canEdit = canEdit;

                const elements = room ? (room.elements as any[]) : [];
                roomCache.set(roomId, elements);
                socket.emit('room:state', elements);
            } catch (err) {
                console.error('Error fetching room state:', err);
                (socket as any).canEdit = true; // Fallback
            }
        });

        socket.on('element:update', ({ roomId, elements }) => {
            if (!(socket as any).canEdit) return;
            roomCache.set(roomId, elements);
            dirtyRooms.add(roomId);
            socket.to(roomId).emit('element:update', elements);
        });

        socket.on('element:create', ({ roomId, element, elements }) => {
            if (!(socket as any).canEdit) return;
            roomCache.set(roomId, elements);
            dirtyRooms.add(roomId);
            socket.to(roomId).emit('element:create', element);
        });

        socket.on('element:delete', ({ roomId, elementId, elements }) => {
            if (!(socket as any).canEdit) return;
            roomCache.set(roomId, elements);
            dirtyRooms.add(roomId);
            socket.to(roomId).emit('element:delete', elementId);
        });

        socket.on('cursor:move', ({ roomId, x, y }) => {
            socket.to(roomId).emit('cursor:move', { x, y, userId: socket.id, color: userColors.get(socket.id) });
        });

        socket.on('disconnecting', () => {
            userColors.delete(socket.id);
            for (const room of socket.rooms) {
                if (room !== socket.id) {
                    const roomUsers = io.sockets.adapter.rooms.get(room);
                    if (roomUsers) {
                        io.to(room).emit('room:users', roomUsers.size - 1);
                    }
                }
            }
        });
    });
}
