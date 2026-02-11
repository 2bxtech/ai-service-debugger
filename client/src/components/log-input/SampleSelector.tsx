
import { useLogStore } from '../../stores/logStore';

const SAMPLES = [
  { id: 'payment-cascade', label: '💳 Payment Cascade', color: 'red' },
  { id: 'config-deploy', label: '🚩 Config Deploy Bug', color: 'yellow' },
  { id: 'db-pool-exhaustion', label: '🗄️ DB Pool Exhaustion', color: 'orange' },
];

export function SampleSelector() {
  const { loadSample, isLoading } = useLogStore();

  return (
    <div>
      <p className="text-xs text-gray-500 mb-2">Load a sample incident:</p>
      <div className="flex gap-2">
        {SAMPLES.map((s) => (
          <button
            key={s.id}
            onClick={() => loadSample(s.id)}
            disabled={isLoading}
            className="px-3 py-1.5 text-xs rounded-md bg-gray-800 text-gray-300
              hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}