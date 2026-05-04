'use client';

import React from 'react';
import { Undo2, Redo2, Minus, Plus } from 'lucide-react';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export const BottomLeftControls: React.FC = () => {
    const { camera, setCamera, undo, redo, theme } = useStore();

    const zoomPercent = Math.round(camera.zoom * 100);

    const handleZoomIn = () => {
        setCamera({ ...camera, zoom: Math.min(camera.zoom * 1.1, 20) });
    };

    const handleZoomOut = () => {
        setCamera({ ...camera, zoom: Math.max(camera.zoom / 1.1, 0.1) });
    };

    return (
        <div className="fixed bottom-4 left-4 z-[60] flex items-center gap-2">
            {/* Zoom Controls */}
            <div className={cn(
                "flex items-center gap-1 p-1 rounded-xl shadow-lg border",
                theme === 'dark' ? "bg-neutral-800 border-neutral-700/50 text-white" : "bg-white border-neutral-200 text-neutral-800"
            )}>
                <button 
                    onClick={handleZoomOut}
                    className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                    title="Zoom Out"
                >
                    <Minus size={16} />
                </button>
                <div className="w-12 text-center text-xs font-bold font-mono" title="Zoom Level">
                    {zoomPercent}%
                </div>
                <button 
                    onClick={handleZoomIn}
                    className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                    title="Zoom In"
                >
                    <Plus size={16} />
                </button>
            </div>

            {/* Undo / Redo */}
            <div className={cn(
                "flex items-center gap-1 p-1 rounded-xl shadow-lg border",
                theme === 'dark' ? "bg-neutral-800 border-neutral-700/50 text-white" : "bg-white border-neutral-200 text-neutral-800"
            )}>
                <button 
                    onClick={undo}
                    className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                    title="Undo (Ctrl+Z)"
                >
                    <Undo2 size={16} />
                </button>
                <button 
                    onClick={redo}
                    className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                    title="Redo (Ctrl+Shift+Z)"
                >
                    <Redo2 size={16} />
                </button>
            </div>
        </div>
    );
};
