import {
    Camera,
    Element,
    Point,
    RectangleElement,
    EllipseElement,
    DiamondElement,
    PencilElement,
    LineElement,
    TextElement,
    ImageElement
} from './types';
import { worldToScreen } from '@/lib/utils';

const imageCache = new Map<string, HTMLImageElement>();

export function renderScene(
    ctx: CanvasRenderingContext2D,
    elements: Element[],
    camera: Camera,
    selectedElementIds: string[],
    width: number,
    height: number,
    theme: 'light' | 'dark'
) {
    ctx.save();
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(camera.x, camera.y);

    // 3. Draw elements
    elements.forEach((element) => {
        drawElement(ctx, element, selectedElementIds.includes(element.id), theme);
    });

    ctx.restore();

    // 4. Draw selection UI (on top, in screen space or world space)
    // Usually it's easier to draw selection highlights in the same coordinate system as elements
}

function drawElement(ctx: CanvasRenderingContext2D, element: Element, isSelected: boolean, theme: 'light' | 'dark') {
    ctx.save();
    ctx.globalAlpha = element.opacity;
    
    let strokeColor = element.stroke;
    if (strokeColor === '#000000' && theme === 'dark') {
        strokeColor = '#ffffff';
    } else if (strokeColor === '#ffffff' && theme === 'light') {
        strokeColor = '#000000';
    }
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = element.strokeWidth;
    ctx.lineCap = element.roundness ? 'round' : 'butt';
    ctx.lineJoin = element.roundness ? 'round' : 'miter';

    if (isSelected) {
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = '#3b82f6'; // Blue-500
    } else {
        if (element.strokeStyle === 'dashed') {
            ctx.setLineDash([10, 5]);
        } else if (element.strokeStyle === 'dotted') {
            ctx.setLineDash([2, 4]);
        } else {
            ctx.setLineDash([]);
        }
    }

    switch (element.type) {
        case 'rectangle':
            ctx.strokeRect(element.x, element.y, element.width, element.height);
            if (element.fill) {
                ctx.fillStyle = element.fill;
                ctx.fillRect(element.x, element.y, element.width, element.height);
            }
            break;

        case 'ellipse':
            ctx.beginPath();
            ctx.ellipse(
                element.x + element.width / 2,
                element.y + element.height / 2,
                Math.abs(element.width / 2),
                Math.abs(element.height / 2),
                0, 0, Math.PI * 2
            );
            ctx.stroke();
            if (element.fill) {
                ctx.fillStyle = element.fill;
                ctx.fill();
            }
            break;

        case 'diamond':
            ctx.beginPath();
            ctx.moveTo(element.x + element.width / 2, element.y);
            ctx.lineTo(element.x + element.width, element.y + element.height / 2);
            ctx.lineTo(element.x + element.width / 2, element.y + element.height);
            ctx.lineTo(element.x, element.y + element.height / 2);
            ctx.closePath();
            ctx.stroke();
            if (element.fill) {
                ctx.fillStyle = element.fill;
                ctx.fill();
            }
            break;

        case 'line':
            ctx.beginPath();
            ctx.moveTo(element.x, element.y);
            if (element.curvePoint) {
                ctx.quadraticCurveTo(element.curvePoint.x, element.curvePoint.y, element.x2, element.y2);
            } else {
                ctx.lineTo(element.x2, element.y2);
            }
            ctx.stroke();
            break;

        case 'arrow':
            drawArrow(ctx, element.x, element.y, element.x2, element.y2, element.curvePoint);
            break;

        case 'pencil':
            const [firstPoint, ...remainingPoints] = element.points;
            if (firstPoint) {
                ctx.beginPath();
                ctx.moveTo(element.x + firstPoint.x, element.y + firstPoint.y);
                for (const p of remainingPoints) {
                    ctx.lineTo(element.x + p.x, element.y + p.y);
                }
                ctx.stroke();
            }
            break;

        case 'text':
            ctx.font = `${element.fontSize}px ${element.fontFamily}`;
            ctx.fillStyle = strokeColor;
            ctx.textBaseline = 'top';
            ctx.fillText(element.content, element.x, element.y);
            break;

        case 'image': {
            const img = imageCache.get(element.url);
            if (img) {
                ctx.drawImage(img, element.x, element.y, element.width, element.height);
            } else {
                const newImg = new Image();
                newImg.src = element.url;
                newImg.onload = () => imageCache.set(element.url, newImg);
                // Draw a placeholder while loading
                ctx.fillStyle = '#e5e7eb';
                ctx.fillRect(element.x, element.y, element.width, element.height);
                ctx.strokeStyle = '#9ca3af';
                ctx.strokeRect(element.x, element.y, element.width, element.height);
            }
            break;
        }
    }

    ctx.restore();

    if (isSelected) {
        drawResizeHandles(ctx, element);
    }
}

function drawArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, curvePoint?: Point) {
    const headlen = 12;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    if (curvePoint) {
        ctx.quadraticCurveTo(curvePoint.x, curvePoint.y, x2, y2);
    } else {
        ctx.lineTo(x2, y2);
    }
    ctx.stroke();

    // Calculate angle at the tip
    const angle = curvePoint
        ? Math.atan2(y2 - curvePoint.y, x2 - curvePoint.x)
        : Math.atan2(y2 - y1, x2 - x1);

    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headlen * Math.cos(angle - Math.PI / 6), y2 - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headlen * Math.cos(angle + Math.PI / 6), y2 - headlen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
}

function drawResizeHandles(ctx: CanvasRenderingContext2D, element: Element) {
    const size = 6;
    ctx.fillStyle = 'white';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1;

    if (element.type === 'line' || element.type === 'arrow') {
        const positions = [
            { x: element.x, y: element.y },
            { x: element.x2, y: element.y2 },
        ];
        if (element.curvePoint) {
            positions.push({ x: element.curvePoint.x, y: element.curvePoint.y });
        } else {
            // Draw a middle circle to indicate curving is possible
            const mid = { x: (element.x + element.x2) / 2, y: (element.y + element.y2) / 2 };
            ctx.beginPath();
            ctx.arc(mid.x, mid.y, size / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }

        positions.forEach(pos => {
            ctx.fillRect(pos.x - size / 2, pos.y - size / 2, size, size);
            ctx.strokeRect(pos.x - size / 2, pos.y - size / 2, size, size);
        });
        return;
    }

    if (element.type === 'pencil') return;

    const { x, y, width, height } = element as RectangleElement | EllipseElement | DiamondElement | ImageElement;

    ctx.fillStyle = 'white';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1;

    const positions = [
        { x, y },
        { x: x + width, y },
        { x, y: y + height },
        { x: x + width, y: y + height },
        { x: x + width / 2, y },
        { x: x + width / 2, y: y + height },
        { x, y: y + height / 2 },
        { x: x + width, y: y + height / 2 },
    ];

    positions.forEach(pos => {
        ctx.fillRect(pos.x - size / 2, pos.y - size / 2, size, size);
        ctx.strokeRect(pos.x - size / 2, pos.y - size / 2, size, size);
    });
}

export function drawSelectionRect(
    ctx: CanvasRenderingContext2D,
    rect: { x: number, y: number, w: number, h: number },
    camera: Camera
) {
    ctx.save();
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
    ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
    ctx.lineWidth = 1;
    // This rect is in world coordinates if we are under translate/scale, or screen space if not.
    // Let's assume we call this outside the main translate/scale for clarity if needed, 
    // but usually it's easier to keep it consistent.
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    ctx.restore();
}
