
import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { useLogStore } from '../../stores/logStore';
import { useIncidentStore } from '../../stores/incidentStore';
import { ChatMessage } from './ChatMessage';
import { SuggestedQuestions } from './SuggestedQuestions';

export function ChatPanel() {
  const [input, setInput] = useState('');
  const { messages, isLoading, sendMessage } = useChatStore();
  const { rawInput } = useLogStore();
  const { serviceGraph } = useIncidentStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input, rawInput, serviceGraph);
    setInput('');
  };

  const handleSuggestion = (q: string) => {
    sendMessage(q, rawInput, serviceGraph);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 text-sm mt-12">
            <p className="text-2xl mb-2">🔍</p>
            <p>Ask the AI debugger anything about the loaded logs.</p>
            <p className="text-xs mt-1 text-gray-600">
              "What's the root cause?" · "Is this a cascade failure?" · "What should I check first?"
            </p>
          </div>
        ) : (
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
        )}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.1s]" />
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
            </div>
            Analyzing...
          </div>
        )}
      </div>

      {/* Suggested questions */}
      {messages.length === 0 && rawInput && (
        <SuggestedQuestions onSelect={handleSuggestion} />
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about the incident..."
            className="flex-1 px-3 py-2 text-sm bg-gray-900 border border-gray-700 rounded-lg
              text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-500
              text-white disabled:opacity-50 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}