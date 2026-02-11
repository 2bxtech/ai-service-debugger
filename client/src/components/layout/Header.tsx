
import { useUIStore } from '../../stores/uiStore';

export function Header() {
  const { theme, toggleTheme } = useUIStore();

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-gray-800 bg-gray-950">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
          
        </div>
        <h1 className="text-lg font-semibold text-gray-100">
          AI Service Debugger
        </h1>
        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
          Prototype
        </span>
      </div>
      <div className="flex items-center gap-4">
        <a
          href="https://github.com/2bxtech/ai-service-debugger"
          target="_blank"
          rel="noopener"
          className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
        >
          GitHub
        </a>
        <button
          onClick={toggleTheme}
          className="text-gray-400 hover:text-gray-200 transition-colors text-sm"
        >
          {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>
    </header>
  );
}