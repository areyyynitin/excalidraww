'use client';

import React from 'react';
import { Image as ImageIcon, FileBox, Copy } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useFileOperations } from '@/hooks/use-file-operations';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const ExportDialog: React.FC = () => {
    const { isExportDialogOpen, setExportDialogOpen, theme } = useStore();
    const { handleExport } = useFileOperations();

    if (!isExportDialogOpen) return null;

    const exportAndClose = (format: 'png' | 'svg' | 'clipboard') => {
        handleExport(format);
        setExportDialogOpen(false);
    };

    return (
        <Dialog open={isExportDialogOpen} onOpenChange={setExportDialogOpen}>
            <DialogContent className={cn(
                "sm:max-w-md rounded-3xl border",
                theme === 'dark' ? "bg-neutral-900 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
            )}>
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold tracking-tight">Export image</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-3 mt-4">
                        <button 
                            onClick={() => exportAndClose('png')}
                            className={cn(
                                "w-full flex items-center gap-4 p-4 rounded-2xl transition-all border group text-left",
                                theme === 'dark' ? "bg-neutral-800/50 border-neutral-700/50 hover:bg-neutral-800 hover:border-neutral-600" : "bg-neutral-50 border-neutral-100 hover:bg-white hover:shadow-md hover:border-neutral-200"
                            )}
                        >
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <ImageIcon size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold">Export to PNG</p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">High-quality image file</p>
                            </div>
                        </button>

                        <button 
                            onClick={() => exportAndClose('svg')}
                            className={cn(
                                "w-full flex items-center gap-4 p-4 rounded-2xl transition-all border group text-left",
                                theme === 'dark' ? "bg-neutral-800/50 border-neutral-700/50 hover:bg-neutral-800 hover:border-neutral-600" : "bg-neutral-50 border-neutral-100 hover:bg-white hover:shadow-md hover:border-neutral-200"
                            )}
                        >
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FileBox size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold">Export to SVG</p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">Scalable vector graphics</p>
                            </div>
                        </button>

                        <button 
                            onClick={() => exportAndClose('clipboard')}
                            className={cn(
                                "w-full flex items-center gap-4 p-4 rounded-2xl transition-all border group text-left",
                                theme === 'dark' ? "bg-neutral-800/50 border-neutral-700/50 hover:bg-neutral-800 hover:border-neutral-600" : "bg-neutral-50 border-neutral-100 hover:bg-white hover:shadow-md hover:border-neutral-200"
                            )}
                        >
                            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Copy size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold">Copy to Clipboard</p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">Paste directly anywhere</p>
                            </div>
                        </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
