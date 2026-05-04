export type Point = {
    x: number;
    y: number;
};

export type Camera = {
    x: number;
    y: number;
    zoom: number;
};

export type ElementType = 'rectangle' | 'ellipse' | 'diamond' | 'pencil' | 'line' | 'arrow' | 'text' | 'image';

export type StrokeStyle = 'solid' | 'dashed' | 'dotted';

export interface BaseElement {
    id: string;
    type: ElementType;
    x: number;
    y: number;
    stroke: string;
    strokeWidth: number;
    opacity: number;
    fill?: string;
    strokeStyle: StrokeStyle;
    roughness: number;
    roundness?: boolean;
    locked?: boolean;
}

export interface RectangleElement extends BaseElement {
    type: 'rectangle';
    width: number;
    height: number;
}

export interface EllipseElement extends BaseElement {
    type: 'ellipse';
    width: number;
    height: number;
}

export interface DiamondElement extends BaseElement {
    type: 'diamond';
    width: number;
    height: number;
}

export interface LineElement extends BaseElement {
    type: 'line';
    x2: number;
    y2: number;
    curvePoint?: Point;
}

export interface ArrowElement extends BaseElement {
    type: 'arrow';
    x2: number;
    y2: number;
    curvePoint?: Point;
}

export interface PencilElement extends BaseElement {
    type: 'pencil';
    points: Point[]; // Relative to (x, y)
}

export interface TextElement extends BaseElement {
    type: 'text';
    content: string;
    fontSize: number;
    fontFamily: string;
}

export interface ImageElement extends BaseElement {
    type: 'image';
    url: string;
    width: number;
    height: number;
}

export type Element = RectangleElement | EllipseElement | DiamondElement | LineElement | ArrowElement | PencilElement | TextElement | ImageElement;

export type Tool = 'select' | 'hand' | 'rectangle' | 'ellipse' | 'diamond' | 'pencil' | 'line' | 'arrow' | 'text' | 'image' | 'eraser' | 'lock';

export type ResizeHandle = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top' | 'bottom' | 'left' | 'right' | 'start' | 'end' | 'curve';

export type InteractionState =
    | { type: 'idle' }
    | { type: 'panning'; startMouse: Point; startCamera: Point }
    | { type: 'drawing'; startPoint: Point; currentElementId: string }
    | { type: 'moving'; startMouse: Point; elementStartPos: Map<string, Point> }
    | { type: 'resizing'; startMouse: Point; elementId: string; handle: ResizeHandle; initialRect: { x: number, y: number, w: number, h: number } }
    | { type: 'selecting'; startMouse: Point; currentSelectionRect?: { x: number, y: number, w: number, h: number } }
    | { type: 'inserting-image'; startPoint: Point }
    | { type: 'erasing' };

