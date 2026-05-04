'use client';

import React from 'react';
import { Camera } from './types';

interface RemoteCursorsProps {
    ctx: CanvasRenderingContext2D;
    camera: Camera;
    cursors: Map<string, { x: number, y: number, userId: string, color: string }>;
}

export const renderRemoteCursors = (
    ctx: CanvasRenderingContext2D,
    camera: Camera,
    cursors: Map<string, { x: number, y: number, userId: string, color: string }>
) => {
    cursors.forEach(cursor => {
        const screenPos = {
            x: (cursor.x + camera.x) * camera.zoom,
            y: (cursor.y + camera.y) * camera.zoom,
        };
        ctx.fillStyle = cursor.color || '#6366f1';
        ctx.beginPath();
        ctx.moveTo(screenPos.x, screenPos.y);
        ctx.lineTo(screenPos.x + 10, screenPos.y + 15);
        ctx.lineTo(screenPos.x + 4, screenPos.y + 15);
        ctx.lineTo(screenPos.x, screenPos.y + 20);
        ctx.closePath();
        ctx.fill();

        // Draw label
        ctx.font = 'bold 10px sans-serif';
        const label = `User ${cursor.userId.slice(0, 4)}`;
        const metrics = ctx.measureText(label);
        ctx.fillStyle = cursor.color || '#6366f1';
        ctx.fillRect(screenPos.x + 10, screenPos.y + 15, metrics.width + 8, 14);
        ctx.fillStyle = 'white';
        ctx.fillText(label, screenPos.x + 14, screenPos.y + 26);
    });
};
