import { Element } from "@/lib/types";

export async function exportToPNG(elements: Element[], canvasBackground: string) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate bounds
    if (elements.length === 0) return;

    const minX = Math.min(...elements.map(e => e.x));
    const minY = Math.min(...elements.map(e => e.y));
    const maxX = Math.max(...elements.map(e => 'width' in e ? e.x + e.width : e.x + (e as any).x2 || e.x));
    const maxY = Math.max(...elements.map(e => 'height' in e ? e.y + e.height : e.y + (e as any).y2 || e.y));

    const padding = 50;
    canvas.width = (maxX - minX) + padding * 2;
    canvas.height = (maxY - minY) + padding * 2;

    // Draw background
    ctx.fillStyle = canvasBackground;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render elements (simple version for export)
    // Note: Ideally we'd use the existing renderer, but for a quick utility we can redraw
    // Or better, we can trigger a render on a temporary canvas.

    return canvas.toDataURL('image/png');
}

export function downloadFile(content: string, fileName: string, contentType: string) {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}
