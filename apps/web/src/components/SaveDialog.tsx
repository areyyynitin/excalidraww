'use client';

import React from 'react';
import { Image as ImageIcon, Download, Sparkles } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useFileOperations } from '@/hooks/use-file-operations';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const SaveDialog: React.FC = () => {
    const { isSaveDialogOpen, setSaveDialogOpen, setExportDialogOpen, theme } = useStore();
    const { saveToFile } = useFileOperations();
    const router = useRouter();

    if (!isSaveDialogOpen) return null;

    return (
        <Dialog open={isSaveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogContent className={cn(
                "sm:max-w-md rounded-3xl border",
                theme === 'dark' ? "bg-neutral-900 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
            )}>
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold tracking-tight">Save to...</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-3 mt-4">
                        <button 
                            onClick={() => {
                                setSaveDialogOpen(false);
                                setTimeout(() => setExportDialogOpen(true), 150);
                            }}
                            className={cn(
                                "w-full flex items-center gap-4 p-4 rounded-2xl transition-all border group text-left",
                                theme === 'dark' ? "bg-neutral-800/50 border-neutral-700/50 hover:bg-neutral-800 hover:border-neutral-600" : "bg-neutral-50 border-neutral-100 hover:bg-white hover:shadow-md hover:border-neutral-200"
                            )}
                        >
                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <ImageIcon size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold">Export as Image</p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">PNG, SVG, or Clipboard</p>
                            </div>
                        </button>

                        <button 
                            onClick={() => {
                                saveToFile();
                                setSaveDialogOpen(false);
                            }}
                            className={cn(
                                "w-full flex items-center gap-4 p-4 rounded-2xl transition-all border group text-left",
                                theme === 'dark' ? "bg-neutral-800/50 border-neutral-700/50 hover:bg-neutral-800 hover:border-neutral-600" : "bg-neutral-50 border-neutral-100 hover:bg-white hover:shadow-md hover:border-neutral-200"
                            )}
                        >
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Download size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold">Save to disk</p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">Local .glyphh backup</p>
                            </div>
                        </button>

                        <button 
                            onClick={() => {
                                setSaveDialogOpen(false);
                                router.push('/premium');
                            }}
                            className={cn(
                                "w-full flex items-center gap-4 p-4 rounded-2xl transition-all border group text-left relative overflow-hidden",
                                theme === 'dark' ? "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/30" : "bg-amber-50 border-amber-100 hover:bg-amber-100 hover:border-amber-200"
                            )}
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-400/20 to-transparent rounded-full blur-xl -mr-10 -mt-10" />
                            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/30">
                                <Sparkles size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-amber-600 dark:text-amber-400">Get Premium</p>
                                <p className="text-xs text-amber-500/80 dark:text-amber-400/70">Cloud sync & unlimited saves</p>
                            </div>
                        </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
