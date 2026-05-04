"use client"
import { useState, useEffect } from 'react';
import { Canvas } from '../src/components/Canvas';
import { Toolbar } from '../src/components/Toolbar';
import { PropertiesPanel } from '../src/components/PropertiesPanel';
import { SettingsPanel } from '../src/components/SettingsPanel';
import { ShareDialog } from '../src/components/ShareDialog';
import { WorkspaceHeader } from '../src/components/WorkspaceHeader';
import { CommandPalette } from '../src/components/CommandPalette';
import { ImportDialog } from '../src/components/ImportDialog';
import { SaveDialog } from '../src/components/SaveDialog';
import { ExportDialog } from '../src/components/ExportDialog';
import { BottomLeftControls } from '../src/components/BottomLeftControls';
import { useStore } from '../src/lib/store';
import { cn } from '../src/lib/utils';
import { useFileOperations } from '../src/hooks/use-file-operations';

export default function Home() {
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedReadOnly, setCopiedReadOnly] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [editKey, setEditKey] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [mounted, setMounted] = useState(false);

  const {
    userCount,
    setRoomId: setStoreRoomId,
    theme,
    setSidebarOpen,
    setCommandPaletteOpen
  } = useStore();

  const { handleImportRequest } = useFileOperations();

  useEffect(() => {
    setMounted(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCommandPaletteOpen]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let room = params.get('room');
    let key = params.get('key');
    const readOnly = params.get('readOnly') === 'true';

    if (!room && typeof window !== 'undefined') {
      const savedRoom = localStorage.getItem('last_room_id');
      const savedKey = localStorage.getItem('last_edit_key');
      if (savedRoom) {
        room = savedRoom;
        key = savedKey;
        params.set('room', room);
        if (key) params.set('key', key);
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, '', newUrl);
      }
    }

    const timeout = setTimeout(() => {
      setRoomId(room);
      setEditKey(key);
      if (room) {
        setStoreRoomId(room);
        localStorage.setItem('last_room_id', room);
        if (key) localStorage.setItem('last_edit_key', key);
      }
      setIsReadOnly(readOnly || (!!room && !key));
    }, 0);
    return () => clearTimeout(timeout);
  }, [setStoreRoomId]);

  if (!mounted) {
    return <main className="w-full h-screen bg-[#fafafa]" />;
  }

  const handleCopy = () => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.delete('readOnly');
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyReadOnly = () => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.delete('key');
    url.searchParams.set('readOnly', 'true');
    navigator.clipboard.writeText(url.toString());
    setCopiedReadOnly(true);
    setTimeout(() => setCopiedReadOnly(false), 2000);
  };

  const handleStartSession = () => {
    if (!roomId) {
      const newRoomId = Math.random().toString(36).substring(2, 11);
      const newKey = Math.random().toString(36).substring(2, 11);
      setRoomId(newRoomId);
      setEditKey(newKey);
      setStoreRoomId(newRoomId);

      const params = new URLSearchParams(window.location.search);
      params.set('room', newRoomId);
      params.set('key', newKey);
      window.history.replaceState({}, '', `?${params.toString()}`);

      localStorage.setItem('last_room_id', newRoomId);
      localStorage.setItem('last_edit_key', newKey);
    }
    setShowShare(false);
  };

  return (
    <main className={cn(
      "w-full h-screen relative overflow-hidden transition-colors duration-500",
      theme === 'dark' ? "bg-neutral-950 text-white" : "bg-[#fafafa] text-neutral-900"
    )}>
      <div className={cn(
        "absolute inset-0 pointer-events-none canvas-grid",
        theme === 'dark' ? "opacity-10 brightness-200 invert" : "opacity-40"
      )} />

      <WorkspaceHeader
        roomName={roomName}
        isReadOnly={isReadOnly}
        userCount={userCount}
        onShowSettings={() => setSidebarOpen(true)}
      />

      <SettingsPanel
        onShare={() => { setSidebarOpen(false); setShowShare(true); }}
        onImportFile={handleImportRequest}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      />

      <CommandPalette />

      <ImportDialog />
      <SaveDialog />
      <ExportDialog />

      <ShareDialog
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        roomId={roomId}
        isReadOnly={isReadOnly}
        copied={copied}
        copiedReadOnly={copiedReadOnly}
        roomName={roomName}
        onCopy={handleCopy}
        onCopyReadOnly={handleCopyReadOnly}
        onStartSession={handleStartSession}
      />

      <Canvas readOnly={isReadOnly} roomId={roomId} />

      {!isReadOnly && (
        <>
          <Toolbar onShare={() => setShowShare(true)} />
          <PropertiesPanel />
          <BottomLeftControls />
        </>
      )}
    </main>
  );
}
