'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type SkeletonVariant =
  | 'stat'
  | 'kpi'
  | 'entity'
  | 'entity-compact'
  | 'kanban'
  | 'list-item'
  | 'dashboard'
  | 'default';

interface CardSkeletonProps {
  variant?: SkeletonVariant;
  className?: string;
}

function StatSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );
}

function KPISkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-6 w-20 mb-2" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EntitySkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex gap-2 mt-4">
          <Skeleton className="h-8 w-20 rounded" />
          <Skeleton className="h-8 w-20 rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

function EntityCompactSkeleton() {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-3/4 mb-1" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

function KanbanSkeleton() {
  return (
    <Card>
      <CardContent className="p-3 pl-4">
        <div className="flex items-start gap-2">
          <Skeleton className="h-4 w-4" />
          <div className="flex-1">
            <Skeleton className="h-4 w-3/4 mb-1" />
            <Skeleton className="h-3 w-1/2 mb-2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-white">
      <Skeleton className="h-8 w-8 rounded-md" />
      <div className="flex-1">
        <Skeleton className="h-4 w-3/4 mb-1" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-6 w-6 rounded-full" />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16 w-full rounded" />
            <Skeleton className="h-16 w-full rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DefaultSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <Skeleton className="h-5 w-3/4 mb-3" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  );
}

export function CardSkeleton({ variant = 'default', className }: CardSkeletonProps) {
  return (
    <div className={cn('animate-pulse', className)}>
      {variant === 'stat' && <StatSkeleton />}
      {variant === 'kpi' && <KPISkeleton />}
      {variant === 'entity' && <EntitySkeleton />}
      {variant === 'entity-compact' && <EntityCompactSkeleton />}
      {variant === 'kanban' && <KanbanSkeleton />}
      {variant === 'list-item' && <ListItemSkeleton />}
      {variant === 'dashboard' && <DashboardSkeleton />}
      {variant === 'default' && <DefaultSkeleton />}
    </div>
  );
}

export default CardSkeleton;
