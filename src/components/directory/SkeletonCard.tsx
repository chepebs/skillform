import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-start gap-4">
        <Skeleton className="w-20 h-20 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-12 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
    </div>
  );
};

export const SkeletonRow: React.FC = () => {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-dark-border">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1 grid grid-cols-7 gap-4 items-center">
        <div className="space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
};
