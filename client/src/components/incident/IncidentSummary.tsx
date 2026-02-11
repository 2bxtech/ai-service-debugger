
import { useIncidentStore } from '../../stores/incidentStore';
import type { AIAnalysis } from '../../types/chat';

export function IncidentSummary() {
  const { analysis, isAnalyzing } = useIncidentStore();

  if (isAnalyzing) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        <div className="text-center">
          <div className="text-3xl mb-3 animate-pulse">🧠</div>
          <p>AI is analyzing the incident...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
        <div className="text-center">
          <p className="text-2xl mb-2">📊</p>
          <p>Load and analyze logs to see the incident summary</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 text-sm">
      {/* Summary */}
      <Section title="Summary">
        <p className="text-gray-300 leading-relaxed">{analysis.summary}</p>
      </Section>

      {/* Root Cause */}
      <Section title="Root Cause">
        <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-xs rounded bg-red-900/50 text-red-300">
              {analysis.rootCause.service}
            </span>
            <span className={`text-xs ${
              analysis.rootCause.confidence === 'high' ? 'text-green-400' :
              analysis.rootCause.confidence === 'medium' ? 'text-yellow-400' : 'text-gray-400'
            }`}>
              {analysis.rootCause.confidence} confidence
            </span>
          </div>
          <p className="text-gray-300">{analysis.rootCause.description}</p>
        </div>
      </Section>

      {/* Cascade Chain */}
      {analysis.cascadeChain?.length > 1 && (
        <Section title="Cascade Chain">
          <div className="flex items-center gap-2 flex-wrap">
            {analysis.cascadeChain.map((svc, i) => (
              <span key={svc} className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs rounded bg-gray-800 text-gray-300">{svc}</span>
                {i < analysis.cascadeChain.length - 1 && (
                  <span className="text-gray-600">→</span>
                )}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Suggested Actions */}
      <Section title="Suggested Actions">
        <div className="space-y-2">
          {analysis.suggestedActions?.map((action, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className={`shrink-0 px-1.5 py-0.5 text-[10px] rounded font-bold uppercase ${
                action.priority === 'immediate' ? 'bg-red-900/50 text-red-300' :
                action.priority === 'short-term' ? 'bg-yellow-900/50 text-yellow-300' :
                'bg-gray-800 text-gray-400'
              }`}>
                {action.priority}
              </span>
              <span className="text-gray-300">{action.action}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Event Timeline */}
      <Section title="Key Events">
        <div className="space-y-1.5">
          {analysis.timeline?.map((evt, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span className={`shrink-0 w-2 h-2 mt-1 rounded-full ${
                evt.significance === 'trigger' ? 'bg-red-400' :
                evt.significance === 'symptom' ? 'bg-yellow-400' : 'bg-gray-500'
              }`} />
              <span className="text-gray-500 shrink-0 w-24 font-mono">
                {evt.timestamp.split('T')[1]?.replace('Z', '').substring(0, 12)}
              </span>
              <span className="text-gray-300">{evt.event}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</h3>
      {children}
    </div>
  );
}