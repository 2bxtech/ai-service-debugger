
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
        {isUser ? (
          <div className="whitespace-pre-wrap">{message.content}</div>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            className="markdown-content"
            components={{
              // Paragraphs
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              // Headings
              h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
              h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
              h3: ({ children }) => <h3 className="text-sm font-bold mb-2">{children}</h3>,
              // Lists
              ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
              li: ({ children }) => <li className="ml-2">{children}</li>,
              // Code
              code: ({ inline, className, children, ...props }: any) => {
                return inline ? (
                  <code
                    className="bg-gray-900 px-1.5 py-0.5 rounded text-blue-300 font-mono text-xs"
                    {...props}
                  >
                    {children}
                  </code>
                ) : (
                  <code
                    className="block bg-gray-900 p-3 rounded my-2 overflow-x-auto font-mono text-xs"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              // Blockquotes
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-400 my-2">
                  {children}
                </blockquote>
              ),
              // Links
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="text-blue-400 hover:text-blue-300 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
              // Strong/Bold
              strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
              // Emphasis/Italic
              em: ({ children }) => <em className="italic">{children}</em>,
              // Horizontal rule
              hr: () => <hr className="my-3 border-gray-700" />,
              // Tables
              table: ({ children }) => (
                <div className="overflow-x-auto my-2">
                  <table className="min-w-full border border-gray-700">{children}</table>
                </div>
              ),
              thead: ({ children }) => <thead className="bg-gray-900">{children}</thead>,
              tbody: ({ children }) => <tbody>{children}</tbody>,
              tr: ({ children }) => <tr className="border-b border-gray-700">{children}</tr>,
              th: ({ children }) => (
                <th className="px-3 py-2 text-left text-xs font-semibold">{children}</th>
              ),
              td: ({ children }) => <td className="px-3 py-2 text-xs">{children}</td>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
        {message.referencedLogLines && message.referencedLogLines.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-400">
            References {message.referencedLogLines.length} log line(s)
          </div>
        )}
      </div>
    </div>
  );
}