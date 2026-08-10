'use client';

import { useRef } from 'react';
import { FileDown, FileUp, ImageDown } from 'lucide-react';
import { canvasRef, exportDesign, importDesign, useStore } from '@/store/useStore';

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'design';
}

export default function ExportControls() {
  const { projectName, setProjectName } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `${slugify(projectName)}-preview.png`;
    link.click();
  };

  const downloadDesignFile = () => {
    const json = exportDesign();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${slugify(projectName)}-design.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') importDesign(reader.result);
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="border-b border-neutral-200 p-4">
      <h2 className="mb-2 font-semibold text-neutral-800">Project</h2>
      <label className="mb-3 block text-xs text-neutral-500">
        Project name
        <input
          type="text"
          value={projectName}
          onChange={(event) => setProjectName(event.target.value)}
          className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm text-neutral-800"
        />
      </label>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={downloadImage}
          className="flex items-center gap-2 rounded border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100"
        >
          <ImageDown className="h-3.5 w-3.5" /> Download image
        </button>
        <button
          type="button"
          onClick={downloadDesignFile}
          className="flex items-center gap-2 rounded border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100"
        >
          <FileDown className="h-3.5 w-3.5" /> Download design file
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 rounded border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100"
        >
          <FileUp className="h-3.5 w-3.5" /> Load design file
        </button>
        <input ref={fileInputRef} type="file" accept="application/json,.json" className="hidden" onChange={handleLoadFile} />
      </div>
    </div>
  );
}
