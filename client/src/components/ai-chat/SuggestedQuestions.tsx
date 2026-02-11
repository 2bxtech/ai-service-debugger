
const QUESTIONS = [
  'What is the root cause of this incident?',
  'Is this a cascade failure? Trace the chain.',
  'What service should I investigate first?',
  'What would you check to confirm the root cause?',
  'Were there any config changes that correlate with the errors?',
  'What is the blast radius of this incident?',
];

export function SuggestedQuestions({ onSelect }: { onSelect: (q: string) => void }) {
  return (
    <div className="px-4 pb-2">
      <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
      <div className="flex flex-wrap gap-1.5">
        {QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            className="px-2.5 py-1 text-xs rounded-full bg-gray-800 text-gray-400
              hover:bg-gray-700 hover:text-gray-200 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}