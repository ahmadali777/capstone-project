'use client';

import { Sparkles, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SceneMoodAnalysisOutput } from '@/lib/tools/sceneMoodAnalysis';

interface ToolCardProps {
  title: string;
  state: 'input-streaming' | 'input-available' | 'output-available' | 'output-error' | 'approval-requested' | 'approval-responded' | 'output-denied';
  input?: unknown;
  output?: SceneMoodAnalysisOutput;
  errorText?: string;
}

function renderMetric(value: number, label: string) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white/70 p-3 shadow-sm">
      <p className="text-xs uppercase tracking-[0.24em] text-neutral-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-neutral-900">{value}</p>
    </div>
  );
}

export default function ToolCard({ title, state, input, output, errorText }: ToolCardProps) {
  const isError = state === 'output-error' || state === 'output-denied';
  const isBusy = state === 'input-streaming' || state === 'input-available' || state === 'approval-requested' || state === 'approval-responded';

  return (
    <div
      className={cn(
        'rounded-2xl border p-3 shadow-sm transition-all duration-300',
        isError
          ? 'border-rose-200 bg-rose-50/80'
          : isBusy
            ? 'border-sky-200 bg-sky-50/80'
            : 'border-emerald-200 bg-emerald-50/80',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {isError ? (
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          ) : isBusy ? (
            <RefreshCw className="h-4 w-4 text-sky-600 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          )}
          <div>
            <p className="text-sm font-semibold text-neutral-900">{title}</p>
            <p className="text-xs text-neutral-600">
              {isError
                ? 'The tool hit a snag and paused the flow.'
                : isBusy
                  ? 'Preparing the analysis request.'
                  : 'A structured result is ready to review.'}
            </p>
          </div>
        </div>
        <div className="rounded-full bg-white/80 px-2 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-600">
          {state.replace('-', ' ')}
        </div>
      </div>

      <div className="mt-3 space-y-3">
        {state === 'input-streaming' && input !== undefined && (
          <div className="rounded-xl border border-sky-200 bg-white/70 p-3">
            <div className="flex items-center gap-2 text-sm font-medium text-sky-700">
              <Sparkles className="h-4 w-4" />
              Streaming tool input
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-700">
              {typeof input === 'string' ? input : JSON.stringify(input, null, 2)}
            </p>
          </div>
        )}

        {state === 'input-available' && input !== undefined && (
          <div className="rounded-xl border border-sky-200 bg-white/70 p-3">
            <p className="text-sm font-medium text-sky-700">Tool input is ready</p>
            <p className="mt-2 text-sm text-neutral-700">
              {typeof input === 'string' ? input : JSON.stringify(input, null, 2)}
            </p>
          </div>
        )}

        {state === 'output-available' && output && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {renderMetric(output.score, 'Score')}
              <div className="rounded-xl border border-neutral-200 bg-white/70 p-3 shadow-sm">
                <p className="text-xs uppercase tracking-[0.24em] text-neutral-500">Label</p>
                <p className="mt-1 text-sm font-semibold text-neutral-900">{output.label}</p>
              </div>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white/70 p-3 shadow-sm">
              <p className="text-sm font-semibold text-neutral-900">Summary</p>
              <p className="mt-1 text-sm text-neutral-700">{output.summary}</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white/70 p-3 shadow-sm">
              <p className="text-sm font-semibold text-neutral-900">Recommended next moves</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-700">
                {output.recommendations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {state === 'output-error' && (
          <div className="rounded-xl border border-rose-200 bg-white/70 p-3">
            <p className="text-sm font-semibold text-rose-700">Tool execution failed</p>
            <p className="mt-2 text-sm text-neutral-700">{errorText ?? 'The mood analysis could not be completed.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
