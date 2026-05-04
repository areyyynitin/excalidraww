'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Command, 
    Search, 
    Image as ImageIcon, 
    FileUp, 
    Save, 
    Share2, 
    Sparkles, 
    MousePointer2,
    Square,
    Circle,
    Type,
    Trash2,
    Undo2,
    Redo2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';

export const CommandPalette: React.FC = () => {
    const { isCommandPaletteOpen, setCommandPaletteOpen, setActiveTool, undo, redo, deleteElement, selectedElementIds } = useStore();
    const [query, setQuery] = useState('');

    const onClose = () => setCommandPaletteOpen(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const commands = [
        { icon: <MousePointer2 size={16} />, label: 'Select Tool', action: () => setActiveTool('select'), shortcut: 'V' },
        { icon: <Square size={16} />, label: 'Rectangle Tool', action: () => setActiveTool('rectangle'), shortcut: 'R' },
        { icon: <Circle size={16} />, label: 'Ellipse Tool', action: () => setActiveTool('ellipse'), shortcut: 'O' },
        { icon: <Type size={16} />, label: 'Text Tool', action: () => setActiveTool('text'), shortcut: 'T' },
        { icon: <Undo2 size={16} />, label: 'Undo', action: undo, shortcut: '⌘Z' },
        { icon: <Redo2 size={16} />, label: 'Redo', action: redo, shortcut: '⌘⇧Z' },
        { icon: <Trash2 size={16} />, label: 'Delete Selected', action: () => selectedElementIds.forEach(id => deleteElement(id)), shortcut: 'Del' },
    ].filter(cmd => cmd.label.toLowerCase().includes(query.toLowerCase()));

    if (!isCommandPaletteOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800"
                >
                    <div className="flex items-center px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
                        <Search size={18} className="text-neutral-400 mr-3" />
                        <input
                            autoFocus
                            placeholder="Type a command or search..."
                            className="flex-1 bg-transparent border-none outline-none text-sm text-neutral-800 dark:text-neutral-200"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <div className="px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-[10px] text-neutral-400">
                            ESC
                        </div>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto p-2">
                        {commands.length > 0 ? (
                            commands.map((cmd, i) => (
                                <button
                                    key={i}
                                    onClick={() => { cmd.action(); onClose(); }}
                                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 group transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="text-neutral-500 group-hover:text-indigo-600 transition-colors">
                                            {cmd.icon}
                                        </div>
                                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white">
                                            {cmd.label}
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-mono text-neutral-400 uppercase">
                                        {cmd.shortcut}
                                    </span>
                                </button>
                            ))
                        ) : (
                            <div className="py-8 text-center text-neutral-400 text-sm italic">
                                No commands found...
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
