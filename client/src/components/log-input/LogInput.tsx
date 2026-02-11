
import { useCallback, useRef } from 'react';
import { useLogStore } from '../../stores/logStore';
import { useIncidentStore } from '../../stores/incidentStore';

export function LogInput() {
  const { rawInput, setRawInput, parseAndLoad, isLoading, error } = useLogStore();
  const { serviceGraph, runInitialAnalysis } = useIncidentStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = useCallback(async () => {
    if (!rawInput.trim()) return;
    await parseAndLoad(rawInput);
    await runInitialAnalysis(rawInput, serviceGraph);
  }, [rawInput, serviceGraph, parseAndLoad, runInitialAnalysis]);

  const handleFileDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (!file) return;
      const text = await file.text();
      setRawInput(text);
    },
    [setRawInput]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const text = await file.text();
      setRawInput(text);
    },
    [setRawInput]
  );

  return (
    <div className="p-4 border-b border-gray-800">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-300">
          Paste logs or drag a file
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            Upload file
          </button>
          <input ref={fileRef} type="file" className="hidden" accept=".log,.txt,.json" onChange={handleFileSelect} />
        </div>
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleFileDrop}
      >
        <textarea
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          placeholder="Paste your logs here, or drag and drop a log file..."
          className="w-full h-32 p-3 text-xs font-mono bg-gray-900 border border-gray-700
            rounded-lg text-gray-300 placeholder-gray-600 resize-none
            focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-400">{error}</p>
      )}

      <button
        onClick={handleAnalyze}
        disabled={!rawInput.trim() || isLoading}
        className="mt-2 px-4 py-2 text-sm font-medium rounded-lg
          bg-blue-600 hover:bg-blue-500 text-white
          disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Analyzing...' : '🔍 Analyze Logs'}
      </button>
    </div>
  );
}
