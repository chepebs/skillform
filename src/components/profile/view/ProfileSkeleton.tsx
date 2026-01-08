import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Skeleton */}
      <div className="rounded-2xl bg-card/50 p-8">
        <div className="flex flex-col items-center">
          <Skeleton className="w-40 h-40 rounded-full mb-6" />
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="flex gap-2 mb-6">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
      </div>

      {/* Stats Bar Skeleton */}
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="flex-1 p-4 bg-card/50">
            <Skeleton className="w-10 h-10 rounded-lg mb-2" />
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-4 w-24" />
          </Card>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-4 border-b border-border pb-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-8 w-24" />
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 bg-card/50">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </Card>
        <Card className="p-6 bg-card/50">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </Card>
      </div>
    </div>
  );
};
