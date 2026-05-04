import { prisma } from "@repo/db/client";

export const roomCache = new Map<string, any[]>();
export const dirtyRooms = new Set<string>();

export function startPersistenceTask() {
    setInterval(async () => {
        if (dirtyRooms.size === 0) return;

        const roomsToSave = Array.from(dirtyRooms);
        dirtyRooms.clear();

        for (const roomId of roomsToSave) {
            const elements = roomCache.get(roomId);
            if (elements) {
                try {
                    await prisma.room.upsert({
                        where: { id: roomId },
                        update: { elements },
                        create: { id: roomId, elements }
                    });
                    console.log(`[DB] Persisted room ${roomId}`);
                } catch (err) {
                    console.error(`[DB Error] Failed to persist room ${roomId}:`, err);
                    dirtyRooms.add(roomId); 
                }
            }
        }
    }, 5000);
}
