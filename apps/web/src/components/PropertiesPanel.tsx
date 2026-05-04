'use client';

import { useStore } from '../lib/store';
import { cn } from '../lib/utils';
import React from 'react';
import { Element, StrokeStyle } from '../lib/types';
import {
    Layers,
    ArrowUp,
    ArrowDown,
    Square,
    Circle,
    LineChart,
    MousePointer2,
    Type
} from 'lucide-react';
import socket from '../lib/socket'

export const PropertiesPanel: React.FC = () => {
    const {
        selectedElementIds,
        elements,
        updateElement,
        pushHistory,
        roomId,
        bringToFront,
        sendToBack
    } = useStore();

    const selectedElements = elements.filter(el => selectedElementIds.includes(el.id));

    if (selectedElements.length === 0) return null;

    const firstElement = selectedElements[0]!;

    const updateSelected = (updates: Partial<Element>) => {
        selectedElementIds.forEach(id => updateElement(id, updates));
        const newElements = elements.map(el =>
            selectedElementIds.includes(el.id) ? { ...el, ...updates } as Element : el
        );
        if (roomId) {
            socket.emit('element:update', { roomId, elements: newElements });
        }
        pushHistory();
    };

    const colors = [
        { name: 'Black', value: '#000000' },
        { name: 'Red', value: '#ef4444' },
        { name: 'Blue', value: '#3b82f6' },
        { name: 'Green', value: '#22c55e' },
        { name: 'Yellow', value: '#eab308' },
        { name: 'White', value: '#ffffff' },
    ];

    return (
        <div className="fixed top-20 left-4 w-60 glass rounded-xl p-4 z-50 flex flex-col gap-6">
            <div>
                <h3 className="sidebar-label">Stroke Color</h3>
                <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                        <button
                            key={color.value}
                            onClick={() => updateSelected({ stroke: color.value })}
                            className={cn(
                                "w-6 h-6 rounded transition-all duration-200 border",
                                firstElement.stroke === color.value
                                    ? "ring-2 ring-offset-2 ring-indigo-500 scale-110 border-neutral-900"
                                    : "border-transparent hover:scale-110"
                            )}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                        />
                    ))}
                </div>
            </div>

            <div>
                <h3 className="sidebar-label">Background</h3>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => updateSelected({ fill: undefined })}
                        className={cn(
                            "w-6 h-6 rounded border transition-all hover:scale-110 flex items-center justify-center bg-neutral-100",
                            !firstElement.strokeWidth ? "border-indigo-500" : "border-neutral-200"
                        )}
                        title="None"
                    >
                        <div className="w-[80%] h-0.5 bg-red-400 rotate-45" />
                    </button>
                    {colors.map((color) => (
                        <button
                            key={color.value}
                            onClick={() => updateSelected({ fill: color.value })}
                            className={cn(
                                "w-6 h-6 rounded border transition-all duration-200",
                                ('fill' in firstElement && firstElement.fill === color.value)
                                    ? "ring-2 ring-offset-2 ring-indigo-500 scale-110 border-neutral-900"
                                    : "border-neutral-200 hover:scale-110"
                            )}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                        />
                    ))}
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-1">
                    <h3 className="sidebar-label mb-0">Stroke Width</h3>
                    <span className="text-[10px] font-bold text-neutral-500">{firstElement.strokeWidth}px</span>
                </div>
                <input
                    type="range"
                    min="1"
                    max="20"
                    value={firstElement.strokeWidth}
                    onChange={(e) => updateSelected({ strokeWidth: parseInt(e.target.value) })}
                    className="w-full h-1 bg-neutral-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
                />
            </div>

            <div>
                <div className="flex justify-between items-center mb-1">
                    <h3 className="sidebar-label mb-0">Opacity</h3>
                    <span className="text-[10px] font-bold text-neutral-500">{Math.round(firstElement.opacity * 100)}%</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={firstElement.opacity}
                    onChange={(e) => updateSelected({ opacity: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-neutral-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
                />
            </div>

            <div>
                <h3 className="sidebar-label">Stroke Style</h3>
                <div className="flex gap-2">
                    {(['solid', 'dashed', 'dotted'] as StrokeStyle[]).map((style) => (
                        <button
                            key={style}
                            onClick={() => updateSelected({ strokeStyle: style })}
                            className={cn(
                                "flex-1 py-1.5 px-2 rounded-lg border text-[10px] font-bold capitalize transition-all",
                                firstElement.strokeStyle === style
                                    ? "bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm"
                                    : "bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300"
                            )}
                        >
                            {style}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-1">
                    <h3 className="sidebar-label mb-0">Sloppiness</h3>
                    <span className="text-[10px] font-bold text-neutral-500">{firstElement.roughness}</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={firstElement.roughness}
                    onChange={(e) => updateSelected({ roughness: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-neutral-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
                />
            </div>

            <div className="flex items-center justify-between">
                <h3 className="sidebar-label mb-0">Edges Rounding</h3>
                <button
                    onClick={() => updateSelected({ roundness: !firstElement.roundness })}
                    className={cn(
                        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none",
                        firstElement.roundness ? "bg-indigo-600" : "bg-neutral-200"
                    )}
                >
                    <span
                        className={cn(
                            "inline-block h-3 w-3 transform rounded-full bg-white transition-transform",
                            firstElement.roundness ? "translate-x-5" : "translate-x-1"
                        )}
                    />
                </button>
            </div>

            <div className="pt-4 border-t border-neutral-100">
                <h3 className="sidebar-label">Layers</h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            bringToFront();
                            if (roomId) {
                                socket.emit('element:update', { roomId, elements: useStore.getState().elements });
                            }
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 transition-colors text-xs font-bold"
                    >
                        <ArrowUp size={14} /> Bring to Front
                    </button>
                    <button
                        onClick={() => {
                            sendToBack();
                            if (roomId) {
                                socket.emit('element:update', { roomId, elements: useStore.getState().elements });
                            }
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 transition-colors text-xs font-bold"
                    >
                        <ArrowDown size={14} /> Send to Back
                    </button>
                </div>
            </div>

            <div className="pt-2 border-t border-neutral-100 flex justify-between items-center">
                <span className="sidebar-label mb-0">Selection Logic</span>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">ACTIVE</span>
            </div>
        </div>
    );
};
