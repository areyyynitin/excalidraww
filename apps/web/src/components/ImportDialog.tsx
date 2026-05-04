'use client';

import React from 'react';
import { AlertCircle, Trash2, Files } from 'lucide-react';
import { useStore } from '@/lib/store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const ImportDialog: React.FC = () => {
    const { 
        isImportDialogOpen, 
        setImportDialogOpen, 
        pendingImportData, 
        setPendingImportData,
        elements,
        setElements
    } = useStore();

    if (!isImportDialogOpen) return null;

    const executeImport = (mode: 'merge' | 'replace') => {
        if (!pendingImportData) return;
        if (mode === 'replace') {
            setElements(pendingImportData.elements);
        } else {
            setElements([...elements, ...pendingImportData.elements]);
        }
        setImportDialogOpen(false);
        setPendingImportData(null);
    };

    return (
        <Dialog open={isImportDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogContent className="sm:max-w-md rounded-3xl border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                <DialogHeader>
                    <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mb-2">
                        <AlertCircle className="text-amber-600" size={24} />
                    </div>
                    <DialogTitle className="text-xl font-bold mb-1">Import elements?</DialogTitle>
                    <DialogDescription className="text-sm text-neutral-500">
                        You already have some work on the canvas. How would you like to proceed?
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-3 mt-4">
                        <button 
                            onClick={() => executeImport('replace')}
                            className="w-full flex items-center gap-3 p-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-2xl transition-colors text-left group"
                        >
                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                <Trash2 size={16} />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold">Replace existing</p>
                                <p className="text-[10px] opacity-70">Current canvas will be cleared</p>
                            </div>
                        </button>
                        <button 
                            onClick={() => executeImport('merge')}
                            className="w-full flex items-center gap-3 p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-2xl transition-colors text-left group"
                        >
                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                <Files size={16} />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold">Merge with existing</p>
                                <p className="text-[10px] opacity-70">Keep your current drawing</p>
                            </div>
                        </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
