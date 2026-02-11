import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex items-center justify-center h-full p-6 bg-gray-900 rounded-lg border border-red-500/30">
      <div className="text-center max-w-md">
        <div className="text-red-400 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-100 mb-2">
          Something went wrong
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          {(error as Error).message || 'An unexpected error occurred in this panel'}
        </p>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
        >
          Try Again
        </button>
        {import.meta.env.DEV && (
          <details className="mt-4 text-left">
            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
              Error details (dev only)
            </summary>
            <pre className="mt-2 p-2 bg-gray-950 text-xs text-red-300 rounded overflow-auto max-h-40">
              {(error as Error).stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  onReset?: () => void;
}

export function ErrorBoundary({ children, onReset }: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={onReset}
      onError={(error, errorInfo) => {
        // Log to console in development
        console.error('Error caught by boundary:', error, errorInfo);
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}
