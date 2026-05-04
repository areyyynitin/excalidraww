'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { renderScene, drawSelectionRect } from '@/lib/renderer';
import { screenToWorld, generateId } from '@/lib/utils';
import { isPointInElement, getHandleAtPoint } from '@/lib/hit-test';
import { Point, Element, Camera, ResizeHandle, Tool } from '@/lib/types';
import { renderRemoteCursors } from '@/lib/cursor-renderer';
import { useCanvasEvents } from '@/hooks/useCanvasEvents';
import socket from '@/lib/socket';

interface CanvasProps {
    readOnly?: boolean;
    roomId: string | null;
}

export const Canvas: React.FC<CanvasProps> = ({ readOnly = false, roomId }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [remoteCursors, setRemoteCursors] = useState<Map<string, { x: number, y: number, userId: string, color: string }>>(new Map());
    const [editingText, setEditingText] = useState<{ id: string, x: number, y: number, content: string } | null>(null);

    const {
        elements, camera, selectedElementIds, activeTool, interaction,
        setInteraction, setCamera, addElement, updateElement, setSelectedElements,
        pushHistory, undo, redo, setActiveTool, setElements, deleteElement, setUserCount,
        canvasBackground, theme,
    } = useStore();

    const zoomAtCenter = useCallback((direction: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        setCamera((prev: Camera) => {
            const newZoom = Math.min(Math.max(prev.zoom * direction, 0.1), 20);
            const rect = canvas.getBoundingClientRect();
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const worldX = centerX / prev.zoom - prev.x;
            const worldY = centerY / prev.zoom - prev.y;
            return {
                zoom: newZoom,
                x: centerX / newZoom - worldX,
                y: centerY / newZoom - worldY,
            };
        });
    }, [setCamera]);

    // Custom Hook for Shortcuts and Clipboard
    useCanvasEvents(readOnly, roomId, camera, zoomAtCenter);

    // Socket setup
    useEffect(() => {
        if (!roomId) return;

        const params = new URLSearchParams(window.location.search);
        const key = params.get('key');
        socket.emit('join-room', { roomId, key });

        socket.on('room:state', (remoteElements: Element[]) => setElements(remoteElements));
        socket.on('element:update', (updatedElements: Element[]) => setElements(updatedElements));
        socket.on('element:create', (newElement: Element) => {
            setElements((prev: Element[]) => [...prev.filter(el => el.id !== newElement.id), newElement]);
        });
        socket.on('element:delete', (id: string) => deleteElement(id));
        socket.on('cursor:move', (data: any) => {
            setRemoteCursors((prev) => new Map(prev).set(data.userId, data));
        });
        socket.on('room:users', (count: number) => setUserCount(count));
        socket.on('user:left', (userId: string) => {
            setRemoteCursors((prev) => {
                const next = new Map(prev);
                next.delete(userId);
                return next;
            });
        });

        return () => {
            ['room:state', 'element:update', 'element:create', 'element:delete', 'cursor:move', 'user:left', 'room:users']
                .forEach(ev => socket.off(ev));
        };
    }, [roomId, setElements, deleteElement, setUserCount]);

    // Render Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const container = containerRef.current;
        if (!container) return;

        let animationId: number;

        const render = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = container.getBoundingClientRect();

            if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.scale(dpr, dpr);

            renderScene(ctx, elements, camera, selectedElementIds, rect.width, rect.height, theme);

            if (interaction.type === 'selecting' && interaction.currentSelectionRect) {
                ctx.save();
                ctx.scale(camera.zoom, camera.zoom);
                ctx.translate(camera.x, camera.y);
                drawSelectionRect(ctx, interaction.currentSelectionRect, camera);
                ctx.restore();
            }

            renderRemoteCursors(ctx, camera, remoteCursors);

            ctx.restore();
            animationId = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationId);
    }, [elements, camera, selectedElementIds, interaction, remoteCursors]);

    // Wheel listener (passive: false)
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                const zoomFactor = 1.1;
                const direction = e.deltaY > 0 ? 1 / zoomFactor : zoomFactor;
                zoomAtCenter(direction);
            } else {
                setCamera((prev: Camera) => ({
                    ...prev,
                    x: prev.x - e.deltaX / prev.zoom,
                    y: prev.y - e.deltaY / prev.zoom,
                }));
            }
        };

        canvas.addEventListener('wheel', handleWheel, { passive: false });
        return () => canvas.removeEventListener('wheel', handleWheel);
    }, [setCamera, zoomAtCenter]);

    const eraseAtPoint = (worldPos: Point) => {
        const elementToErase = [...elements].reverse().find(el => isPointInElement(worldPos, el));
        if (elementToErase && !elementToErase.locked) {
            const remainingElements = elements.filter(el => el.id !== elementToErase.id);
            if (roomId) socket.emit('element:delete', { roomId, elementId: elementToErase.id, elements: remainingElements });
            deleteElement(elementToErase.id);
            pushHistory();
        }
    };

    const onPointerDown = (e: React.PointerEvent) => {
        if (readOnly) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const screenPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        const worldPos = screenToWorld(screenPos, camera);

        if (editingText) {
            updateElement(editingText.id, { content: editingText.content });
            pushHistory();
            setEditingText(null);
            return;
        }

        if (e.button === 1 || activeTool === 'hand' || (activeTool === 'select' && e.shiftKey)) {
            setInteraction({ type: 'panning', startMouse: screenPos, startCamera: { ...camera } });
            return;
        }

        if (activeTool === 'eraser') {
            setInteraction({ type: 'erasing' });
            eraseAtPoint(worldPos);
            return;
        }

        if (activeTool === 'lock') {
            const clickedElement = [...elements].reverse().find(el => isPointInElement(worldPos, el));
            if (clickedElement) {
                const newLocked = !clickedElement.locked;
                updateElement(clickedElement.id, { locked: newLocked });
                const updatedElements = elements.map(e => e.id === clickedElement.id ? { ...e, locked: newLocked } : e);
                if (roomId) socket.emit('element:update', { roomId, elements: updatedElements });
                pushHistory();
            }
            return;
        }

        if (activeTool === 'select') {
            for (const id of selectedElementIds) {
                const el = elements.find(e => e.id === id);
                if (el) {
                    const handle = getHandleAtPoint(worldPos, el, camera.zoom);
                    if (handle) {
                        const w = 'width' in el ? el.width : 0;
                        const h = 'height' in el ? el.height : 0;
                        setInteraction({ type: 'resizing', elementId: id, handle: handle as ResizeHandle, startMouse: worldPos, initialRect: { x: el.x, y: el.y, w, h } });
                        return;
                    }
                }
            }

            const clickedElement = [...elements].reverse().find(el => isPointInElement(worldPos, el) && !el.locked);
            if (clickedElement) {
                if (!selectedElementIds.includes(clickedElement.id)) {
                    setSelectedElements(e.metaKey || e.ctrlKey ? [...selectedElementIds, clickedElement.id] : [clickedElement.id]);
                }
                const elementStartPos = new Map<string, Point>();
                const ids = e.metaKey || e.ctrlKey ? [...selectedElementIds, clickedElement.id] : [clickedElement.id];
                ids.forEach(id => {
                    const el = elements.find(e => e.id === id);
                    if (el) elementStartPos.set(id, { x: el.x, y: el.y });
                });
                setInteraction({ type: 'moving', startMouse: worldPos, elementStartPos });
            } else {
                setSelectedElements([]);
                setInteraction({ type: 'selecting', startMouse: worldPos });
            }
        } else if (activeTool === 'image') {
            // ... image upload logic remains similar
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (ev) => {
                const file = (ev.target as HTMLInputElement).files?.[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (re) => {
                        const url = re.target?.result as string;
                        const img = new Image();
                        img.src = url;
                        img.onload = () => {
                            const id = generateId();
                            const newElement: Element = { id, type: 'image', x: worldPos.x - img.width / 4, y: worldPos.y - img.height / 4, url, width: img.width / 2, height: img.height / 2, stroke: '#000000', strokeWidth: 0, opacity: 1, strokeStyle: 'solid', roughness: 0 };
                            addElement(newElement);
                            if (roomId) socket.emit('element:create', { roomId, element: newElement, elements: [...elements, newElement] });
                            pushHistory();
                        };
                    };
                    reader.readAsDataURL(file);
                }
            };
            input.click();
            setActiveTool('select');
        } else {
            const id = generateId();
            let newElement: Element;
            const base = { id, x: worldPos.x, y: worldPos.y, stroke: theme === 'dark' ? '#ffffff' : '#000000', strokeWidth: 2, opacity: 1, strokeStyle: 'solid' as const, roughness: 0, roundness: true };

            if (activeTool === 'rectangle') newElement = { ...base, type: 'rectangle', width: 0, height: 0 };
            else if (activeTool === 'ellipse') newElement = { ...base, type: 'ellipse', width: 0, height: 0 };
            else if (activeTool === 'diamond') newElement = { ...base, type: 'diamond', width: 0, height: 0 };
            else if (activeTool === 'line') newElement = { ...base, type: 'line', x2: worldPos.x, y2: worldPos.y };
            else if (activeTool === 'arrow') newElement = { ...base, type: 'arrow', x2: worldPos.x, y2: worldPos.y };
            else if (activeTool === 'pencil') newElement = { ...base, type: 'pencil', points: [{ x: 0, y: 0 }] };
            else if (activeTool === 'text') {
                newElement = { ...base, type: 'text', content: '', fontSize: 20, fontFamily: 'sans-serif' };
                addElement(newElement);
                if (roomId) socket.emit('element:create', { roomId, element: newElement, elements: [...elements, newElement] });
                setSelectedElements([id]);
                setEditingText({ id, x: worldPos.x, y: worldPos.y, content: '' });
                return;
            } else return;

            addElement(newElement);
            if (roomId) socket.emit('element:create', { roomId, element: newElement, elements: [...elements, newElement] });
            setInteraction({ type: 'drawing', startPoint: worldPos, currentElementId: id });
        }
    };

    const onPointerMove = (e: React.PointerEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const screenPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        const worldPos = screenToWorld(screenPos, camera);

        if (roomId) socket.emit('cursor:move', { roomId, x: worldPos.x, y: worldPos.y });

        if (interaction.type === 'erasing') {
            eraseAtPoint(worldPos);
        } else if (interaction.type === 'panning') {
            const dx = (screenPos.x - interaction.startMouse.x) / camera.zoom;
            const dy = (screenPos.y - interaction.startMouse.y) / camera.zoom;
            setCamera({ x: interaction.startCamera.x + dx, y: interaction.startCamera.y + dy });
        } else if (interaction.type === 'drawing') {
            const el = elements.find(e => e.id === interaction.currentElementId);
            if (!el) return;
            let updates = {};
            if (el.type === 'rectangle' || el.type === 'ellipse' || el.type === 'diamond') updates = { width: worldPos.x - interaction.startPoint.x, height: worldPos.y - interaction.startPoint.y };
            else if (el.type === 'line' || el.type === 'arrow') updates = { x2: worldPos.x, y2: worldPos.y };
            else if (el.type === 'pencil') updates = { points: [...el.points, { x: worldPos.x - el.x, y: worldPos.y - el.y }] };
            updateElement(el.id, updates);
            if (roomId) socket.emit('element:update', { roomId, elements: elements.map(e => e.id === el.id ? { ...e, ...updates } : e) });
        } else if (interaction.type === 'moving') {
            const dx = worldPos.x - interaction.startMouse.x;
            const dy = worldPos.y - interaction.startMouse.y;
            interaction.elementStartPos.forEach((startPos, id) => updateElement(id, { x: startPos.x + dx, y: startPos.y + dy }));
            if (roomId) socket.emit('element:update', { roomId, elements: elements.map(e => { const startPos = interaction.elementStartPos.get(e.id); return startPos ? { ...e, x: startPos.x + dx, y: startPos.y + dy } : e; }) });
        } else if (interaction.type === 'resizing') {
            const el = elements.find(e => e.id === interaction.elementId);
            if (!el) return;
            const dx = worldPos.x - interaction.startMouse.x;
            const dy = worldPos.y - interaction.startMouse.y;
            let updates: Partial<Element> = {};
            if (el.type === 'line' || el.type === 'arrow') {
                if (interaction.handle === 'start') updates = { x: interaction.initialRect.x + dx, y: interaction.initialRect.y + dy };
                else if (interaction.handle === 'end') updates = { x2: el.x2 + dx, y2: el.y2 + dy };
            } else {
                const { x, y, w, h } = interaction.initialRect;
                let nx = x, ny = y, nw = w, nh = h;
                switch (interaction.handle) {
                    case 'top-left': nx += dx; ny += dy; nw -= dx; nh -= dy; break;
                    case 'top-right': ny += dy; nw += dx; nh -= dy; break;
                    case 'bottom-left': nx += dx; nw -= dx; nh += dy; break;
                    case 'bottom-right': nw += dx; nh += dy; break;
                    case 'top': ny += dy; nh -= dy; break;
                    case 'bottom': nh += dy; break;
                    case 'left': nx += dx; nw -= dx; break;
                    case 'right': nw += dx; break;
                }
                updates = { x: nx, y: ny, width: nw, height: nh };
            }
            updateElement(el.id, updates);
            if (roomId) socket.emit('element:update', { roomId, elements: elements.map(e => e.id === el.id ? { ...e, ...updates } : e) });
        } else if (interaction.type === 'selecting') {
            const x = Math.min(interaction.startMouse.x, worldPos.x), y = Math.min(interaction.startMouse.y, worldPos.y);
            const w = Math.abs(interaction.startMouse.x - worldPos.x), h = Math.abs(interaction.startMouse.y - worldPos.y);
            setInteraction({ ...interaction, currentSelectionRect: { x, y, w, h } });
            setSelectedElements(elements.filter(el => el.x >= x && el.x <= x + w && el.y >= y && el.y <= y + h).map(el => el.id));
        }
    };

    const onPointerUp = () => {
        if (interaction.type !== 'idle') {
            if (interaction.type === 'drawing') {
                if (['rectangle', 'ellipse', 'diamond', 'line', 'arrow'].includes(activeTool)) setActiveTool('select');
                pushHistory();
            } else if (['moving', 'selecting', 'resizing'].includes(interaction.type)) pushHistory();
            setInteraction({ type: 'idle' });
        }
    };

    return (
        <div ref={containerRef} className="w-full h-full relative overflow-hidden transition-colors duration-300" style={{ backgroundColor: canvasBackground }}>
            <canvas ref={canvasRef} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp} className="w-full h-full touch-none cursor-crosshair" />

            {editingText && (
                <textarea
                    autoFocus
                    className="absolute bg-transparent border-none outline-none p-0 m-0 font-sans leading-tight overflow-visible whitespace-pre-wrap resize-none z-[100]"
                    style={{ left: (editingText.x + camera.x) * camera.zoom, top: (editingText.y + camera.y) * camera.zoom, fontSize: 20 * camera.zoom, color: elements.find(el => el.id === editingText.id)?.stroke || '#000000', width: 'auto', minWidth: '100px' }}
                    value={editingText.content}
                    onChange={(e) => {
                        const newContent = e.target.value;
                        setEditingText({ ...editingText, content: newContent });
                        updateElement(editingText.id, { content: newContent });
                        if (roomId) socket.emit('element:update', { roomId, elements: elements.map(e => e.id === editingText.id ? { ...e, content: newContent } : e) });
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); pushHistory(); setEditingText(null); } }}
                    onBlur={() => { pushHistory(); setEditingText(null); }}
                />
            )}
        </div>
    );
};
