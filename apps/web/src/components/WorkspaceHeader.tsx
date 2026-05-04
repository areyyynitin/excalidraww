'use client';

import React from 'react';
import { Menu, Lock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';

interface WorkspaceHeaderProps {
    roomName: string;
    isReadOnly: boolean;
    userCount: number;
    onShowSettings: () => void;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
    roomName,
    isReadOnly,
    userCount,
    onShowSettings
}) => {
    const { theme } = useStore();

    return (
        <div className="fixed top-4 left-4 z-[60] flex items-center gap-3">
            <button
                onClick={onShowSettings}
                className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg",
                    theme === 'dark' ? "bg-neutral-800 text-white shadow-neutral-900/50 hover:bg-neutral-700" : "bg-white text-neutral-800 shadow-indigo-200/50 hover:bg-neutral-50"
                )}
            >
                <Menu size={20} />
            </button>

            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    {isReadOnly && (
                        <span className="flex items-center gap-1 bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase">
                            <Lock size={8} /> Read Only
                        </span>
                    )}
                    {userCount > 1 && (
                        <span className="flex items-center gap-1 bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase animate-pulse">
                            <Users size={8} /> {userCount} Online
                        </span>
                    )}
                </div>
                <span className={cn(
                    "text-sm font-semibold",
                    theme === 'dark' ? "text-neutral-300" : "text-neutral-800"
                )}>{roomName}</span>
            </div>
        </div>
    );
};
