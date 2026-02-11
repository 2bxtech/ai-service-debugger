export function TimelineSkeleton() {
  return (
    <div className="px-4 py-2 space-y-2 animate-pulse">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex gap-3">
          <div className="w-36 h-4 bg-gray-800 rounded" />
          <div className="flex-1">
            <div className="h-4 bg-gray-800 rounded w-16 mb-2" />
            <div className="h-3 bg-gray-800/50 rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AnalysisSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-6 bg-gray-800 rounded w-48" />
        <div className="h-4 bg-gray-800/50 rounded w-full" />
        <div className="h-4 bg-gray-800/50 rounded w-5/6" />
      </div>

      {/* Section skeletons */}
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-5 bg-gray-800 rounded w-32" />
          <div className="h-3 bg-gray-800/50 rounded w-full" />
          <div className="h-3 bg-gray-800/50 rounded w-11/12" />
          <div className="h-3 bg-gray-800/50 rounded w-4/5" />
        </div>
      ))}
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="p-4 space-y-4 animate-pulse">
      {/* AI message skeleton */}
      <div className="flex justify-start">
        <div className="max-w-[90%] space-y-2">
          <div className="h-16 bg-gray-800 rounded-lg w-96" />
        </div>
      </div>
    </div>
  );
}
