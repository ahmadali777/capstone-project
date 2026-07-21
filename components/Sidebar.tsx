'use client';

import { useState } from 'react';
import { useStore, AssetType } from '@/store/useStore';

const ASSETS: { type: AssetType; label: string; emoji: string }[] = [
  { type: 'sofa', label: 'Sofa', emoji: '🛋️' },
  { type: 'chair', label: 'Chair', emoji: '🪑' },
  { type: 'table', label: 'Table', emoji: '🟤' },
  { type: 'lamp', label: 'Lamp', emoji: '💡' },
  { type: 'plant', label: 'Plant', emoji: '🪴' },
  { type: 'rug', label: 'Rug', emoji: '🟫' },
];

export default function Sidebar() {
  const {
    addObject,
    selectedId,
    removeObject,
    suggestion,
    setSuggestion,
    setWallColor,
    setFloorMaterial,
    setLightingMood,
  } = useStore();

  const [uploading, setUploading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatLog, setChatLog] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [sendingChat, setSendingChat] = useState(false);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const res = await fetch('/api/analyze-room', { method: 'POST', body: formData });
      const data = await res.json();
      setSuggestion(data);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  }

  function applySuggestion() {
    if (!suggestion) return;
    if (suggestion.wallColor) setWallColor(suggestion.wallColor);
    if (suggestion.floorMaterial) setFloorMaterial(suggestion.floorMaterial as any);
  }

  async function sendChat() {
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatLog((log) => [...log, { role: 'user', text: msg }]);
    setChatInput('');
    setSendingChat(true);
    try {
      const res = await fetch('/api/scene-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      if (data.wallColor) setWallColor(data.wallColor);
      if (data.floorMaterial) setFloorMaterial(data.floorMaterial);
      if (data.lightingMood) setLightingMood(data.lightingMood);
      setChatLog((log) => [
        ...log,
        { role: 'ai', text: `Set mood: ${data.lightingMood ?? '—'}, wall: ${data.wallColor ?? '—'}, floor: ${data.floorMaterial ?? '—'}` },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setSendingChat(false);
    }
  }

  return (
    <div className="w-80 h-full bg-white border-l border-neutral-200 flex flex-col overflow-y-auto">
      <div className="p-4 border-b border-neutral-200">
        <h2 className="font-semibold text-neutral-800 mb-2">1. Upload a room photo</h2>
        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="text-sm" />
        {uploading && <p className="text-xs text-neutral-500 mt-2">Analyzing photo…</p>}
        {suggestion && (
          <div className="mt-3 text-sm bg-neutral-50 rounded p-2 border border-neutral-200">
            <p className="font-medium mb-1">AI style suggestion</p>
            {suggestion.moodTags && <p className="text-xs text-neutral-600">Mood: {suggestion.moodTags.join(', ')}</p>}
            {suggestion.suggestedFurniture && (
              <p className="text-xs text-neutral-600">Try: {suggestion.suggestedFurniture.join(', ')}</p>
            )}
            <button
              onClick={applySuggestion}
              className="mt-2 text-xs bg-neutral-800 text-white rounded px-2 py-1"
            >
              Apply to room
            </button>
          </div>
        )}
      </div>

      <div className="p-4 border-b border-neutral-200">
        <h2 className="font-semibold text-neutral-800 mb-2">2. Add furniture</h2>
        <div className="grid grid-cols-3 gap-2">
          {ASSETS.map((a) => (
            <button
              key={a.type}
              onClick={() => addObject(a.type)}
              className="flex flex-col items-center gap-1 border border-neutral-200 rounded p-2 hover:bg-neutral-50 text-xs"
            >
              <span className="text-xl">{a.emoji}</span>
              {a.label}
            </button>
          ))}
        </div>
        {selectedId && (
          <button
            onClick={() => removeObject(selectedId)}
            className="mt-3 text-xs text-red-600 underline"
          >
            Delete selected item
          </button>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h2 className="font-semibold text-neutral-800 mb-2">3. Ask the AI to restyle</h2>
        <div className="flex-1 overflow-y-auto text-xs space-y-2 mb-2 max-h-48">
          {chatLog.map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
              <span
                className={
                  'inline-block rounded px-2 py-1 ' +
                  (m.role === 'user' ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-700')
                }
              >
                {m.text}
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendChat()}
            placeholder="e.g. make it cozy"
            className="flex-1 border border-neutral-300 rounded px-2 py-1 text-sm"
          />
          <button
            onClick={sendChat}
            disabled={sendingChat}
            className="bg-neutral-800 text-white rounded px-3 py-1 text-sm disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
