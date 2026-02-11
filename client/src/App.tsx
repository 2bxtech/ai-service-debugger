
import { useUIStore } from './stores/uiStore';
import { Header } from './components/layout/Header';
import { LogInput } from './components/log-input/LogInput';
import { SampleSelector } from './components/log-input/SampleSelector';
import { Timeline } from './components/timeline/Timeline';
import { ChatPanel } from './components/ai-chat/ChatPanel';
import { IncidentSummary } from './components/incident/IncidentSummary';
import { ServiceGraph } from './components/service-graph/ServiceGraph';

export default function App() {
  const { theme, activePanel } = useUIStore();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-950 text-gray-100' : 'bg-white text-gray-900'}`}>
      <Header />
      <main className="flex h-[calc(100vh-4rem)]">
        {/* Left Panel: Logs + Timeline */}
        <div className="flex-1 flex flex-col border-r border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <SampleSelector />
          </div>
          <LogInput />
          <Timeline />
        </div>

        {/* Right Panel: AI + Analysis */}
        <div className="w-[480px] flex flex-col overflow-hidden">
          <div className="flex border-b border-gray-800">
            <TabButton panel="analysis" label="Analysis" />
            <TabButton panel="chat" label="AI Debug" />
            <TabButton panel="graph" label="Service Graph" />
          </div>
          <div className="flex-1 overflow-auto">
            {activePanel === 'analysis' && <IncidentSummary />}
            {activePanel === 'chat' && <ChatPanel />}
            {activePanel === 'graph' && <ServiceGraph />}
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