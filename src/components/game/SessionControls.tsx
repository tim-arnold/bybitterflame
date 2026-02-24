"use client";

interface SessionControlsProps {
  onEndSession: () => void;
  onSaveSession: () => void;
  sessionNumber: number;
  isLoading?: boolean;
}

export function SessionControls({ onEndSession, onSaveSession, sessionNumber, isLoading }: SessionControlsProps) {
  return (
    <div className="bg-stone-900 border border-stone-700 rounded-lg p-3 space-y-2">
      <h3 className="text-xs uppercase tracking-wider text-stone-500">Session {sessionNumber}</h3>
      <div className="flex flex-col gap-1.5">
        <button
          onClick={onSaveSession}
          disabled={isLoading}
          className="w-full rounded bg-stone-800 border border-stone-700 px-3 py-1.5 text-sm text-stone-300 hover:border-stone-600 transition-colors disabled:opacity-50"
        >
          Save Progress
        </button>
        <button
          onClick={onEndSession}
          disabled={isLoading}
          className="w-full rounded bg-stone-800 border border-red-900/50 px-3 py-1.5 text-sm text-red-400 hover:bg-red-900/20 transition-colors disabled:opacity-50"
        >
          End Session
        </button>
      </div>
    </div>
  );
}
