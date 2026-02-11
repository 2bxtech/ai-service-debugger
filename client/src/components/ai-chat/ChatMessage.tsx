
import type { ChatMessage as ChatMessageType } from '../../types/chat';

export function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[90%] rounded-lg px-4 py-3 text-sm leading-relaxed
          ${isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-800 text-gray-200'
          }`}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>
        {message.referencedLogLines && message.referencedLogLines.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-400">
            References {message.referencedLogLines.length} log line(s)
          </div>
        )}
      </div>
    </div>
  );
}