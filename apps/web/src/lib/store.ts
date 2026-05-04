import { create } from 'zustand';
import { Camera, Element, Tool, InteractionState } from './types';

interface SceneState {
    elements: Element[];
    camera: Camera;
    selectedElementIds: string[];
    activeTool: Tool;
    interaction: InteractionState;
    roomId: string | null;
    theme: 'light' | 'dark';
    canvasBackground: string;
    gridEnabled: boolean;
    
    // UI State
    isSidebarOpen: boolean;
    isCommandPaletteOpen: boolean;
    isImportDialogOpen: boolean;
    isSaveDialogOpen: boolean;
    isExportDialogOpen: boolean;
    pendingImportData: any | null;

    // History
    history: Element[][];
    historyIndex: number;

    // Actions
    setElements: (elements: Element[] | ((prev: Element[]) => Element[])) => void;
    addElement: (element: Element) => void;
    updateElement: (id: string, updates: Partial<Element>) => void;
    setSelectedElements: (ids: string[]) => void;
    setCamera: (camera: Partial<Camera> | ((prev: Camera) => Camera)) => void;
    setActiveTool: (tool: Tool) => void;
    setInteraction: (interaction: InteractionState) => void;
    setGridEnabled: (enabled: boolean) => void;
    setRoomId: (id: string) => void;
    toggleTheme: () => void;
    setCanvasBackground: (bg: string) => void;
    clearElements: () => void;
    
    // UI Actions
    setSidebarOpen: (open: boolean) => void;
    setCommandPaletteOpen: (open: boolean) => void;
    setImportDialogOpen: (open: boolean) => void;
    setSaveDialogOpen: (open: boolean) => void;
    setExportDialogOpen: (open: boolean) => void;
    setPendingImportData: (data: any | null) => void;

    syncElement: (element: Element) => void;
    deleteElement: (id: string) => void;
    setUserCount: (count: number) => void;
    userCount: number;

    undo: () => void;
    redo: () => void;
    pushHistory: () => void;
    bringToFront: () => void;
    sendToBack: () => void;
}

export const useStore = create<SceneState>((set, get) => ({
    elements: [],
    camera: { x: 0, y: 0, zoom: 1 },
    selectedElementIds: [],
    activeTool: 'select',
    interaction: { type: 'idle' },
    roomId: null,
    userCount: 1,
    theme: 'light',
    canvasBackground: '#ffffff',
    gridEnabled: true,
    
    isSidebarOpen: false,
    isCommandPaletteOpen: false,
    isImportDialogOpen: false,
    isSaveDialogOpen: false,
    isExportDialogOpen: false,
    pendingImportData: null,

    history: [[]],
    historyIndex: 0,

    setElements: (elements) => set((state) => ({
        elements: typeof elements === 'function' ? elements(state.elements) : elements
    })),

    addElement: (element) => set((state) => ({
        elements: [...state.elements, element]
    })),

    updateElement: (id, updates) => set((state) => ({
        elements: state.elements.map(el => el.id === id ? { ...el, ...updates } as Element : el)
    })),

    setSelectedElements: (ids) => set({ selectedElementIds: ids }),

    setCamera: (camera) => set((state) => ({
        camera: typeof camera === 'function' ? camera(state.camera) : { ...state.camera, ...camera }
    })),

    setActiveTool: (tool) => set({ activeTool: tool }),

    setInteraction: (interaction) => set({ interaction }),
    setRoomId: (id) => set({ roomId: id }),
    setGridEnabled: (gridEnabled) => set({ gridEnabled }),
    toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'light' ? 'dark' : 'light',
        canvasBackground: state.theme === 'light' ? '#121212' : '#ffffff'
    })),
    setCanvasBackground: (bg) => set({ canvasBackground: bg }),
    clearElements: () => set({ elements: [], selectedElementIds: [], history: [[]], historyIndex: 0 }),
    
    setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
    setCommandPaletteOpen: (isCommandPaletteOpen) => set({ isCommandPaletteOpen }),
    setImportDialogOpen: (isImportDialogOpen) => set({ isImportDialogOpen }),
    setSaveDialogOpen: (isSaveDialogOpen) => set({ isSaveDialogOpen }),
    setExportDialogOpen: (isExportDialogOpen) => set({ isExportDialogOpen }),
    setPendingImportData: (pendingImportData) => set({ pendingImportData }),

    syncElement: (element) => set((state) => {
        const exists = state.elements.find(el => el.id === element.id);
        if (exists) {
            return {
                elements: state.elements.map(el => el.id === element.id ? element : el)
            };
        }
        return {
            elements: [...state.elements, element]
        };
    }),

    deleteElement: (id) => set((state) => ({
        elements: state.elements.filter(el => el.id !== id),
        selectedElementIds: state.selectedElementIds.filter(sid => sid !== id)
    })),

    setUserCount: (count) => set({ userCount: count }),

    pushHistory: () => {
        const { elements, history, historyIndex } = get();
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push([...elements]);
        set({
            history: newHistory,
            historyIndex: newHistory.length - 1
        });
    },

    undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex > 0) {
            const prevState = history[historyIndex - 1];
            if (prevState) {
                set({
                    elements: [...prevState],
                    historyIndex: historyIndex - 1
                });
            }
        }
    },

    redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex < history.length - 1) {
            const nextState = history[historyIndex + 1];
            if (nextState) {
                set({
                    elements: [...nextState],
                    historyIndex: historyIndex + 1
                });
            }
        }
    },
    bringToFront: () => {
        const { elements, selectedElementIds } = get();
        if (selectedElementIds.length === 0) return;
        const selected = elements.filter(el => selectedElementIds.includes(el.id));
        const unselected = elements.filter(el => !selectedElementIds.includes(el.id));
        set({ elements: [...unselected, ...selected] });
    },
    sendToBack: () => {
        const { elements, selectedElementIds } = get();
        if (selectedElementIds.length === 0) return;
        const selected = elements.filter(el => selectedElementIds.includes(el.id));
        const unselected = elements.filter(el => !selectedElementIds.includes(el.id));
        set({ elements: [...selected, ...unselected] });
    },
}));
