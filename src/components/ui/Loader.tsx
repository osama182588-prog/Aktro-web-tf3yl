"use client"

export function Loader({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizes[size]} relative`}>
        <div className="absolute inset-0 border-2 border-blue-500/20 rounded-full"></div>
        <div className="absolute inset-0 border-2 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 relative mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-400 text-lg">جارٍ التحميل...</p>
      </div>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="glass-card p-6 animate-pulse">
      <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
      <div className="h-3 bg-gray-700 rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-gray-700 rounded w-2/3"></div>
    </div>
  )
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i} 
          className="h-3 bg-gray-700 rounded" 
          style={{ width: `${100 - (i * 15)}%` }}
        ></div>
      ))}
    </div>
  )
}
