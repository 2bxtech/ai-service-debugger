
import { useUIStore } from '../../stores/uiStore';

export function Header() {
  const { theme, toggleTheme } = useUIStore();
  const isDark = theme === 'dark';

  return (
    <header className={`h-16 flex items-center justify-between px-6 border-b ${
      isDark ? 'border-gray-800 bg-gray-950' : 'border-gray-200 bg-white'
    }`}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
          D
        </div>
        <h1 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
          AI Service Debugger
        </h1>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          isDark ? 'text-gray-500 bg-gray-800' : 'text-gray-600 bg-gray-100'
        }`}>
          Prototype
        </span>
      </div>
      <div className="flex items-center gap-4">
        <a
          href="https://github.com/2bxtech/ai-service-debugger"
          target="_blank"
          rel="noopener"
          className={`text-sm transition-colors ${
            isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          GitHub
        </a>
        <button
          onClick={toggleTheme}
          className={`transition-colors text-sm ${
            isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {isDark ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>
    </header>
  );
}