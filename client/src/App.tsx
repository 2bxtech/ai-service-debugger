
import { useRef } from 'react';
import { useUIStore } from './stores/uiStore';
import { Header } from './components/layout/Header';
import { LogInput, LogInputRef } from './components/log-input/LogInput';
import { SampleSelector } from './components/log-input/SampleSelector';
import { Timeline, TimelineRef } from './components/timeline/Timeline';
import { ChatPanel, ChatPanelRef } from './components/ai-chat/ChatPanel';
import { IncidentSummary } from './components/incident/IncidentSummary';
import { ServiceGraph } from './components/service-graph/ServiceGraph';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { useKeyboardShortcuts, isMac } from './hooks/useKeyboardShortcuts';

export default function App() {
  const { theme, activePanel, setActivePanel } = useUIStore();
  const timelineRef = useRef<TimelineRef>(null);
  const logInputRef = useRef<LogInputRef>(null);
  const chatPanelRef = useRef<ChatPanelRef>(null);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'k',
      ctrl: !isMac,
      meta: isMac,
      handler: () => timelineRef.current?.focusSearch(),
      description: 'Focus search',
    },
    {
      key: 'Enter',
      ctrl: !isMac,
      meta: isMac,
      handler: () => logInputRef.current?.analyze(),
      description: 'Analyze logs',
    },
    {
      key: 'c',
      ctrl: !isMac,
      meta: isMac,
      shift: true,
      handler: () => {
        setActivePanel('chat');
        setTimeout(() => chatPanelRef.current?.focusInput(), 100);
      },
      description: 'Focus chat',
    },
  ]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-gray-950 text-gray-100' : 'bg-white text-gray-900'}`}>
      <Header />
      <main className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
        {/* Left Panel: Logs + Timeline */}
        <div className="flex-1 flex flex-col border-r border-gray-800 overflow-hidden min-h-[50vh] lg:min-h-0">
          <div className="p-4 border-b border-gray-800">
            <ErrorBoundary>
              <SampleSelector />
            </ErrorBoundary>
          </div>
          <ErrorBoundary>
            <LogInput ref={logInputRef} />
          </ErrorBoundary>
          <ErrorBoundary>
            <Timeline ref={timelineRef} />
          </ErrorBoundary>
        </div>

        {/* Right Panel: AI + Analysis */}
        <div className="w-full lg:w-[480px] flex flex-col overflow-hidden min-h-[50vh] lg:min-h-0">
          <div className="flex border-b border-gray-800">
            <TabButton panel="analysis" label="Analysis" />
            <TabButton panel="chat" label="AI Debug" />
            <TabButton panel="graph" label="Service Graph" />
          </div>
          <div className="flex-1 overflow-auto">
            {activePanel === 'analysis' && (
              <ErrorBoundary>
                <IncidentSummary />
              </ErrorBoundary>
            )}
            {activePanel === 'chat' && (
              <ErrorBoundary>
                <ChatPanel ref={chatPanelRef} />
              </ErrorBoundary>
            )}
            {activePanel === 'graph' && (
              <ErrorBoundary>
                <ServiceGraph />
              </ErrorBoundary>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function TabButton({ panel, label }: { panel: 'analysis' | 'chat' | 'graph'; label: string }) {
  const { activePanel, setActivePanel } = useUIStore();
  const isActive = activePanel === panel;
  return (
    <button
      onClick={() => setActivePanel(panel)}
      className={`flex-1 py-2.5 text-sm font-medium transition-colors
        ${isActive
          ? 'text-blue-400 border-b-2 border-blue-400'
          : 'text-gray-500 hover:text-gray-300'
        }`}
    >
      {label}
    </button>
  );
}