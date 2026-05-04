'use client';

import { useStore } from '../lib/store';

export function useFileOperations() {
    const {
        elements,
        setElements,
        theme,
        canvasBackground,
        setImportDialogOpen,
        setPendingImportData
    } = useStore();

    const saveToFile = () => {
        const data = {
            type: "glyphh",
            version: 1,
            elements: elements,
            appState: { theme, canvasBackground }
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `whiteboard-${new Date().toISOString().split('T')[0]}.glyphh`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleImportRequest = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.draw,.glyphh,application/json';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            const text = await file.text();
            try {
                const data = JSON.parse(text);
                if (data.elements && Array.isArray(data.elements)) {
                    if (elements.length > 0) {
                        setPendingImportData(data);
                        setImportDialogOpen(true);
                    } else {
                        setElements(data.elements);
                    }
                }
            } catch (err) {
                alert("Invalid file format");
            }
        };
        input.click();
    };

    const handleExport = async (format: 'png' | 'svg' | 'clipboard' = 'png') => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return;

        if (format === 'clipboard') {
            try {
                const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve));
                if (blob) {
                    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                    alert("Copied to clipboard!");
                }
            } catch (e) { console.error(e); }
            return;
        }

        const link = document.createElement('a');
        link.download = `whiteboard.${format}`;
        link.href = canvas.toDataURL(`image/${format}`);
        link.click();
    };

    return {
        saveToFile,
        handleImportRequest,
        handleExport
    };
}
