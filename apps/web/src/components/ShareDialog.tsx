'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Copy, Check, Users, Shield, Eye, Lock, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';

interface ShareDialogProps {
    isOpen: boolean;
    onClose: () => void;
    roomId: string | null;
    isReadOnly: boolean;
    copied: boolean;
    copiedReadOnly: boolean;
    roomName: string;
    onCopy: () => void;
    onCopyReadOnly: () => void;
    onStartSession: () => void;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({
    isOpen,
    onClose,
    roomId,
    isReadOnly,
    copied,
    copiedReadOnly,
    roomName,
    onCopy,
    onCopyReadOnly,
    onStartSession
}) => {
    const { theme } = useStore();

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className={cn(
                            "w-full max-w-md rounded-3xl p-8 shadow-2xl relative overflow-hidden",
                            theme === 'dark' ? "bg-neutral-900 text-white" : "bg-white text-neutral-900"
                        )}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                        >
                            <X size={20} className="text-neutral-400" />
                        </button>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                                <Share2 size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold tracking-tight">Share Whiteboard</h2>
                                <p className="text-sm text-neutral-500">Collaborate with others in real-time</p>
                            </div>
                        </div>

                        {!roomId ? (
                            <div className="space-y-6">
                                <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-white dark:bg-neutral-800 flex items-center justify-center shadow-sm">
                                            <Shield size={16} className="text-indigo-600" />
                                        </div>
                                        <h3 className="font-bold text-sm text-indigo-900 dark:text-indigo-300">Live Session Ready</h3>
                                    </div>
                                    <p className="text-xs text-indigo-700/70 dark:text-indigo-300/70 leading-relaxed mb-6">
                                        Once you start a session, your drawing will be synced to our cloud and you'll get a secret link to share.
                                    </p>
                                    <button
                                        onClick={onStartSession}
                                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        Start Real-time Session
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {/* Collaboration Section */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Users size={16} className="text-indigo-500" />
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Collaboration Link</h3>
                                        </div>
                                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Live Now</span>
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                            <Lock size={14} className="text-neutral-400" />
                                        </div>
                                        <input
                                            type="text"
                                            readOnly
                                            value={typeof window !== 'undefined' ? window.location.href : ''}
                                            className="w-full pl-10 pr-24 py-4 bg-neutral-50 dark:bg-neutral-800 border-2 border-neutral-100 dark:border-neutral-700 rounded-2xl text-sm font-medium focus:outline-none"
                                        />
                                        <button
                                            onClick={onCopy}
                                            className="absolute right-2 top-2 bottom-2 px-4 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-xl text-xs font-bold shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-600 transition-all flex items-center gap-2"
                                        >
                                            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                            {copied ? 'Copied' : 'Copy'}
                                        </button>
                                    </div>
                                    <p className="mt-2 text-[10px] text-neutral-400 px-1 italic">
                                        Anyone with this link can view and edit the whiteboard.
                                    </p>
                                </div>

                                {/* Read-only Section */}
                                <div className="pt-8 border-t border-neutral-100 dark:border-neutral-800">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Eye size={16} className="text-amber-500" />
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Export as Read-only</h3>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 px-4 py-4 bg-neutral-50 dark:bg-neutral-800 rounded-2xl text-sm font-medium text-neutral-400 truncate border border-dashed border-neutral-200 dark:border-neutral-700">
                                            {typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?room=${roomId}&readOnly=true` : ''}
                                        </div>
                                        <button
                                            onClick={onCopyReadOnly}
                                            className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all shadow-sm"
                                            title="Copy read-only link"
                                        >
                                            {copiedReadOnly ? <Check size={20} /> : <Copy size={20} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
