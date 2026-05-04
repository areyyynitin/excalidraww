'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    FolderOpen,
    Download,
    Image as ImageIcon,
    Users,
    Zap,
    Search,
    HelpCircle,
    Trash2,
    Wand2,
    MessageSquare,
    LogIn,
    SlidersHorizontal,
    Sun,
    Moon,
    Monitor,
    ChevronRight,
    ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';

interface SettingsPanelProps {
    onShare: () => void;
    onImportFile: () => void;
    onOpenCommandPalette: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
    onShare,
    onImportFile,
    onOpenCommandPalette
}) => {
    const {
        theme,
        toggleTheme,
        canvasBackground,
        setCanvasBackground,
        isSidebarOpen,
        setSidebarOpen,
        clearElements,
        setSaveDialogOpen,
        setExportDialogOpen
    } = useStore();

    const onClose = () => setSidebarOpen(false);

    // Background color swatches based on the theme
    const backgroundSwatches = theme === 'dark'
        ? ['#121212', '#1e1e1e', '#232329', '#2b2a26', '#2a2424', '#1f1f1f']
        : ['#ffffff', '#f8f9fa', '#f1f3f5', '#fff4e6', '#f8f0fc', '#e6fcf5'];

    return (
        <AnimatePresence>
            {isSidebarOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[55]" // Invisible backdrop to close
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className={cn(
                            "fixed top-3 left-3 w-[260px] max-h-[calc(100vh-24px)] overflow-y-auto rounded-xl p-2 z-[60] shadow-xl",
                            theme === 'dark' ? "bg-[#232329] text-[#e0e0e0]" : "bg-white text-neutral-800"
                        )}
                        style={{ border: theme === 'dark' ? '1px solid #32323d' : '1px solid #e5e7eb' }}
                    >
                        <div className="space-y-0.5">
                            <MenuItem icon={<FolderOpen size={16} />} label="Open" shortcut="Ctrl+O" onClick={onImportFile} />
                            <MenuItem icon={<Download size={16} />} label="Save to..." onClick={() => setSaveDialogOpen(true)} />
                            <MenuItem icon={<ImageIcon size={16} />} label="Export image..." shortcut="Ctrl+Shift+E" onClick={() => setExportDialogOpen(true)} />
                            <MenuItem icon={<Users size={16} />} label="Live collaboration..." onClick={onShare} />
                            <MenuItem icon={<Zap size={16} className="text-indigo-400" />} label="Command palette" labelClass="font-semibold text-indigo-400" shortcut="Ctrl+/" onClick={onOpenCommandPalette} />
                            <MenuItem icon={<Search size={16} />} label="Find on canvas" shortcut="Ctrl+F" />
                            <MenuItem icon={<Trash2 size={16} />} label="Reset the canvas" onClick={clearElements} />
                        </div>

                        <div className="my-2 border-t" style={{ borderColor: theme === 'dark' ? '#32323d' : '#f3f4f6' }} />



                        <div className="my-2 border-t" style={{ borderColor: theme === 'dark' ? '#32323d' : '#f3f4f6' }} />

                        <div className="space-y-3 px-2 py-1">
                            <div className="flex items-center justify-between cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <SlidersHorizontal size={16} className="text-neutral-400 group-hover:text-neutral-200" />
                                    <span className="text-sm font-medium">Preferences</span>
                                </div>
                                <ChevronRight size={14} className="text-neutral-500" />
                            </div>

                            {/* Theme Toggle */}
                            <div className="flex items-center justify-between pt-1">
                                <span className="text-sm">Theme</span>
                                <div className="flex items-center bg-[#2c2c35] rounded-lg p-0.5" style={{ backgroundColor: theme === 'dark' ? '#2c2c35' : '#f3f4f6' }}>
                                    <button onClick={() => theme === 'dark' && toggleTheme()} className={cn("p-1.5 rounded-md", theme === 'light' ? "bg-indigo-500 text-white" : "text-neutral-400 hover:text-neutral-200")}>
                                        <Sun size={14} />
                                    </button>
                                    <button onClick={() => theme === 'light' && toggleTheme()} className={cn("p-1.5 rounded-md", theme === 'dark' ? "bg-indigo-400 text-white" : "text-neutral-400 hover:text-neutral-600")}>
                                        <Moon size={14} />
                                    </button>
                                    <button className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
                                        <Monitor size={14} />
                                    </button>
                                </div>
                            </div>



                            {/* Canvas Background */}
                            <div className="space-y-2">
                                <span className="text-sm">Canvas background</span>
                                <div className="flex items-center gap-1.5">
                                    {backgroundSwatches.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setCanvasBackground(color)}
                                            className={cn(
                                                "w-6 h-6 rounded-md border transition-all",
                                                canvasBackground === color ? "border-indigo-400 scale-110" : "border-transparent"
                                            )}
                                            style={{
                                                backgroundColor: color,
                                                boxShadow: theme === 'light' ? '0 0 0 1px rgba(0,0,0,0.1)' : '0 0 0 1px rgba(255,255,255,0.05)'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

// Helper component for menu items
const MenuItem = ({
    icon,
    label,
    shortcut,
    onClick,
    labelClass
}: {
    icon: React.ReactNode;
    label: string;
    shortcut?: string;
    onClick?: () => void;
    labelClass?: string;
}) => {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-[#32323d] transition-colors text-left group"
        >
            <div className="flex items-center gap-3">
                <div className="text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors">
                    {icon}
                </div>
                <span className={cn("text-sm font-medium text-neutral-700 dark:text-[#e0e0e0]", labelClass)}>
                    {label}
                </span>
            </div>
            {shortcut && (
                <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
                    {shortcut}
                </span>
            )}
        </button>
    );
};
