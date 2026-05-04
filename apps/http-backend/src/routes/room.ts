import { Router } from 'express';
import { prisma } from "@repo/db/client";

const router: Router = Router();

// Get all rooms
router.get("/", async (req, res) => {
    try {
        const rooms = await prisma.room.findMany({
            orderBy: { updatedAt: 'desc' }
        });
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch rooms" });
    }
});

// Create or Update a room
router.post("/", async (req, res) => {
    const { id, name, description } = req.body;
    try {
        const room = await prisma.room.upsert({
            where: { id },
            update: { name, description },
            create: { id, name, description, elements: [] }
        });
        res.json(room);
    } catch (error) {
        res.status(500).json({ error: "Failed to create/update room" });
    }
});

export default router;
