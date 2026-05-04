import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Point, Camera } from "./types"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function screenToWorld(point: Point, camera: Camera): Point {
    return {
        x: point.x / camera.zoom - camera.x,
        y: point.y / camera.zoom - camera.y,
    }
}

export function worldToScreen(point: Point, camera: Camera): Point {
    return {
        x: (point.x + camera.x) * camera.zoom,
        y: (point.y + camera.y) * camera.zoom,
    }
}

export function generateId() {
    return Math.random().toString(36).substring(2, 9);
}
