'use client';

import React from 'react';
import {
    Hand,
    Image as ImageIcon,
    Square,
    Circle,
    MousePointer2,
    Pencil,
    Minus,
    Type,
    Undo2,
    Redo2,
    Trash2,
    Download,
    Diamond,
    ArrowRight,
    Share2,
    Eraser,
    Lock,
    Save,
    FileUp,
    FileCode,
    Sparkles,
    ChevronDown
} from 'lucide-react';
import { useStore } from '../lib/store';
import { Tool } from '../lib/types';
import { cn } from '../lib/utils';
import socket from '../lib/socket';

interface ToolbarProps {
    onShare: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onShare }) => {
    const {
        activeTool,
        setActiveTool,
        undo,
        redo,
        elements,
        setElements,
        selectedElementIds,
        setSelectedElements,
        pushHistory,
        roomId,
        theme,
        canvasBackground
    } = useStore();



    const tools: { id: Tool; icon: any; label: string }[] = [
        { id: 'lock', icon: Lock, label: 'Lock' },
        { id: 'hand', icon: Hand, label: 'Hand' },
        { id: 'select', icon: MousePointer2, label: 'Selection' },
        { id: 'rectangle', icon: Square, label: 'Rectangle' },
        { id: 'ellipse', icon: Circle, label: 'Ellipse' },
        { id: 'diamond', icon: Diamond, label: 'Diamond' },
        { id: 'line', icon: Minus, label: 'Line' },
        { id: 'arrow', icon: ArrowRight, label: 'Arrow' },
        { id: 'pencil', icon: Pencil, label: 'Pencil' },
        { id: 'text', icon: Type, label: 'Text' },
        { id: 'image', icon: ImageIcon, label: 'Image' },
        { id: 'eraser', icon: Eraser, label: 'Eraser' },
    ];





    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 glass rounded-xl z-50">
            <div className="flex items-center gap-1 border-r border-neutral-100 pr-1">
                {tools.map((tool) => (
                    <button
                        key={tool.id}
                        onClick={() => setActiveTool(tool.id)}
                        title={tool.label}
                        className={cn(
                            "p-2 rounded-lg transition-all duration-200 group relative",
                            activeTool === tool.id
                                ? "bg-indigo-50 text-indigo-600 shadow-sm"
                                : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                        )}
                    >
                        <tool.icon size={18} strokeWidth={2} />
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-1 pl-1">


                <button
                    onClick={onShare}
                    title="Share workflow"
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                    <Share2 size={18} strokeWidth={2} />
                </button>
            </div>
        </div>
    );
};
