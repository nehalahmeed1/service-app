import React from 'react';

const LoadingSkeleton = ({ count = 6 }) => {
  return (
    <>
      {Array.from({ length: count })?.map((_, index) => (
        <div 
          key={index}
          className="bg-card rounded-xl overflow-hidden border border-border animate-pulse"
        >
          <div className="h-48 md:h-56 lg:h-64 bg-muted" />
          <div className="p-4 md:p-5 lg:p-6 space-y-4">
            <div className="space-y-2">
              <div className="h-6 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
            <div className="flex gap-2">
              <div className="h-6 bg-muted rounded w-20" />
              <div className="h-6 bg-muted rounded w-20" />
              <div className="h-6 bg-muted rounded w-20" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </div>
            <div className="flex gap-2">
              <div className="h-10 bg-muted rounded flex-1" />
              <div className="h-10 bg-muted rounded flex-1" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default LoadingSkeleton;