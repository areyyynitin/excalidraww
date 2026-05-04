'use client';

import { useEffect } from 'react';
import { useStore } from '../lib/store';
import { generateId } from '../lib/utils';
import socket from '../lib/socket';
import { Camera, Element, Tool } from '../lib/types';

export const useCanvasEvents = (
    readOnly: boolean,
    roomId: string | null,
    camera: Camera,
    zoomAtCenter: (dir: number) => void
) => {
    const {
        elements,
        setElements,
        selectedElementIds,
        setSelectedElements,
        activeTool,
        setActiveTool,
        setInteraction,
        pushHistory,
        undo,
        redo,
        setCamera,
        theme
    } = useStore();

    useEffect(() => {
        if (readOnly) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            // Undo/Redo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                if (e.shiftKey) redo();
                else undo();
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                e.preventDefault();
                redo();
            }

            // Zoom
            if (e.ctrlKey || e.metaKey) {
                if (e.key === '=' || e.key === '+') {
                    e.preventDefault();
                    zoomAtCenter(1.2);
                } else if (e.key === '-') {
                    e.preventDefault();
                    zoomAtCenter(1 / 1.2);
                } else if (e.key === '0') {
                    e.preventDefault();
                    setCamera((prev) => ({ ...prev, zoom: 1 }));
                }
            } else if (e.key === 'Escape') {
                setActiveTool('select');
                setSelectedElements([]);
                setInteraction({ type: 'idle' });
            }

            // Tools
            if (!e.ctrlKey && !e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 'v': case '1': setActiveTool('select'); break;
                    case 'h': case '2': setActiveTool('hand'); break;
                    case 'r': case '3': setActiveTool('rectangle'); break;
                    case 'o': case '4': setActiveTool('ellipse'); break;
                    case 'd': case '5': setActiveTool('diamond'); break;
                    case 'l': case '6': setActiveTool('line'); break;
                    case 'a': setActiveTool('arrow'); break;
                    case 'p': case '7': setActiveTool('pencil'); break;
                    case 't': case '8': setActiveTool('text'); break;
                    case 'i': setActiveTool('image'); break;
                    case 'e': case '0': setActiveTool('eraser'); break;
                    case 'k': setActiveTool('lock'); break;
                    case 'backspace': case 'delete':
                        if (selectedElementIds.length > 0) {
                            const remainingElements = elements.filter(el => !selectedElementIds.includes(el.id));
                            if (roomId) {
                                selectedElementIds.forEach(id => socket.emit('element:delete', { roomId, elementId: id, elements: remainingElements }));
                            }
                            setElements(remainingElements);
                            setSelectedElements([]);
                            pushHistory();
                        }
                        break;
                }
            }
        };

        const handleCopy = (e: ClipboardEvent) => {
            if (selectedElementIds.length === 0) return;
            const selectedElements = elements.filter(el => selectedElementIds.includes(el.id));
            const data = JSON.stringify({ type: 'glyphh-elements', elements: selectedElements });
            e.clipboardData?.setData('text/plain', data);
            e.preventDefault();
        };

        const handlePaste = async (e: ClipboardEvent) => {
            if (readOnly) return;

            const text = e.clipboardData?.getData('text/plain');
            if (text) {
                try {
                    const data = JSON.parse(text);
                    if (data.type === 'glyphh-elements') {
                        const newElements = data.elements.map((el: any) => ({
                            ...el,
                            id: generateId(),
                            x: el.x + 20,
                            y: el.y + 20
                        }));
                        const nextElements = [...elements, ...newElements];
                        setElements(nextElements);
                        if (roomId) socket.emit('element:update', { roomId, elements: nextElements });
                        setSelectedElements(newElements.map((el: any) => el.id));
                        pushHistory();
                        return;
                    }
                } catch (err) { }
            }

            const items = e.clipboardData?.items;
            if (items) {
                for (const item of Array.from(items)) {
                    if (item.type.startsWith('image/')) {
                        const file = item.getAsFile();
                        if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                                const url = event.target?.result as string;
                                const id = generateId();
                                const newElement: Element = {
                                    id,
                                    type: 'image',
                                    url,
                                    x: camera.x + window.innerWidth / 2 / camera.zoom - 100,
                                    y: camera.y + window.innerHeight / 2 / camera.zoom - 100,
                                    width: 200,
                                    height: 200,
                                    stroke: theme === 'dark' ? '#ffffff' : '#000000',
                                    strokeWidth: 0,
                                    opacity: 1,
                                    strokeStyle: 'solid',
                                    roughness: 0,
                                };
                                const nextElements = [...elements, newElement];
                                setElements(nextElements);
                                if (roomId) socket.emit('element:update', { roomId, elements: nextElements });
                                pushHistory();
                            };
                            reader.readAsDataURL(file);
                        }
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('copy', handleCopy);
        window.addEventListener('paste', handlePaste);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('copy', handleCopy);
            window.removeEventListener('paste', handlePaste);
        };
    }, [undo, redo, setActiveTool, selectedElementIds, elements, setElements, setSelectedElements, pushHistory, readOnly, roomId, setCamera, camera, theme, zoomAtCenter, setInteraction]);
};
