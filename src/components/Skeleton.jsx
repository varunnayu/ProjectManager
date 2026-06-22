import React from "react";

export function SkeletonCard() {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div className="skeleton skeleton-title w-1/2" />
        <div className="skeleton w-12 h-6 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="skeleton skeleton-text w-full" />
        <div className="skeleton skeleton-text w-5/6" />
      </div>
      <div className="pt-2 flex justify-between items-center border-t border-gray-900/10">
        <div className="skeleton w-24 h-4" />
        <div className="skeleton w-16 h-4" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonList({ count = 4 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-4 flex items-center gap-4">
          <div className="skeleton skeleton-avatar flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton skeleton-title w-1/3" style={{ marginBottom: "4px" }} />
            <div className="skeleton skeleton-text w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonLog() {
  return (
    <div className="glass-card p-4 flex items-start gap-4">
      <div className="skeleton skeleton-avatar flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton skeleton-title w-1/4" />
        <div className="skeleton skeleton-text w-5/6" />
        <div className="skeleton skeleton-text w-2/3" />
      </div>
    </div>
  );
}

export function SkeletonLogsList({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonLog key={i} />
      ))}
    </div>
  );
}
