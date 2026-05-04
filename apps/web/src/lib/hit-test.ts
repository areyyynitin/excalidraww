import { Element, Point, ResizeHandle } from './types';

export function getHandleAtPoint(point: Point, element: Element, zoom: number): ResizeHandle | null {
    const size = 10 / zoom;

    if (element.type === 'line' || element.type === 'arrow') {
        const handles = [
            { handle: 'start' as any, x: element.x, y: element.y },
            { handle: 'end' as any, x: element.x2, y: element.y2 },
        ];
        if (element.curvePoint) {
            handles.push({ handle: 'curve' as any, x: element.curvePoint.x, y: element.curvePoint.y });
        } else {
            handles.push({ handle: 'curve' as any, x: (element.x + element.x2) / 2, y: (element.y + element.y2) / 2 });
        }

        for (const h of handles) {
            if (distance(point, h) < size) return h.handle;
        }
        return null;
    }

    if (element.type === 'pencil') return null;

    const { x, y, width, height } = element as any;

    const handles: { handle: ResizeHandle, x: number, y: number }[] = [
        { handle: 'top-left', x, y },
        { handle: 'top-right', x: x + width, y },
        { handle: 'bottom-left', x, y: y + height },
        { handle: 'bottom-right', x: x + width, y: y + height },
        { handle: 'top', x: x + width / 2, y },
        { handle: 'bottom', x: x + width / 2, y: y + height },
        { handle: 'left', x, y: y + height / 2 },
        { handle: 'right', x: x + width, y: y + height / 2 },
    ];

    for (const h of handles) {
        if (
            point.x >= h.x - size / 2 &&
            point.x <= h.x + size / 2 &&
            point.y >= h.y - size / 2 &&
            point.y <= h.y + size / 2
        ) {
            return h.handle;
        }
    }

    return null;
}

export function isPointInElement(point: Point, element: Element): boolean {
    switch (element.type) {
        case 'rectangle':
        case 'image':
            return (
                point.x >= Math.min(element.x, element.x + (element as any).width) &&
                point.x <= Math.max(element.x, element.x + (element as any).width) &&
                point.y >= Math.min(element.y, element.y + (element as any).height) &&
                point.y <= Math.max(element.y, element.y + (element as any).height)
            );

        case 'ellipse': {
            const centerX = element.x + element.width / 2;
            const centerY = element.y + element.height / 2;
            const rx = Math.abs(element.width / 2);
            const ry = Math.abs(element.height / 2);
            if (rx === 0 || ry === 0) return false;
            const dx = point.x - centerX;
            const dy = point.y - centerY;
            return (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1;
        }

        case 'diamond': {
            const centerX = element.x + element.width / 2;
            const centerY = element.y + element.height / 2;
            const dx = Math.abs(point.x - centerX);
            const dy = Math.abs(point.y - centerY);
            const hw = Math.abs(element.width / 2);
            const hh = Math.abs(element.height / 2);
            if (hw === 0 || hh === 0) return false;
            return dx / hw + dy / hh <= 1;
        }

        case 'line':
        case 'arrow': {
            // Distance from point to line segment
            const { x, y, x2, y2 } = element as any;
            const L2 = (x2 - x) ** 2 + (y2 - y) ** 2;
            if (L2 === 0) return distance(point, { x, y }) < 5;
            let t = ((point.x - x) * (x2 - x) + (point.y - y) * (y2 - y)) / L2;
            t = Math.max(0, Math.min(1, t));
            const px = x + t * (x2 - x);
            const py = y + t * (y2 - y);
            return distance(point, { x: px, y: py }) < 5 * (1 / (point as any).zoom || 1); // rough zoom compensation
        }

        case 'pencil': {
            // Check if point is close to any segment
            for (let i = 0; i < element.points.length - 1; i++) {
                const pt1 = element.points[i];
                const pt2 = element.points[i + 1];
                if (pt1 && pt2) {
                    const p1 = { x: element.x + pt1.x, y: element.y + pt1.y };
                    const p2 = { x: element.x + pt2.x, y: element.y + pt2.y };
                    const d = distToSegment(point, p1, p2);
                    if (d < 5) return true;
                }
            }
            return false;
        }

        case 'text':
            // Rough estimation based on font size and content length
            const textWidth = element.content.length * element.fontSize * 0.6;
            return (
                point.x >= element.x &&
                point.x <= element.x + textWidth &&
                point.y >= element.y &&
                point.y <= element.y + element.fontSize
            );
    }
    return false;
}

function distance(p1: Point, p2: Point) {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

function distToSegment(p: Point, v: Point, w: Point) {
    const l2 = distanceSq(v, w);
    if (l2 === 0) return distance(p, v);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return distance(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) });
}

function distanceSq(p1: Point, p2: Point) {
    return (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2;
}
