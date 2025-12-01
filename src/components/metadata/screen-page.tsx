/**
 * Screen Page Wrapper
 * 
 * Client component that handles data fetching and renders the ScreenRenderer.
 * This is the bridge between Next.js pages and our Metadata UI system.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';
import type { ScreenDefinition } from '@/lib/metadata/types';
import { useQuery } from '@tanstack/react-query'; // Assuming tanstack query or trpc
import { Skeleton } from '@/components/ui/skeleton';

// In a real app, this would be a tRPC router or similar
// For now, we'll simulate a data fetcher
async function fetchScreenData(
  definition: ScreenDefinition, 
  params: Record<string, string>, 
  searchParams: Record<string, string>
) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock data based on entityType
  if (definition.dataSource?.type === 'entity' && definition.entityType === 'job') {
    return {
      id: params.id,
      title: 'Senior Software Engineer',
      status: 'open',
      priority: 'high',
      location: 'San Francisco, CA',
      description: 'We are looking for a senior engineer...',
      requiredSkills: ['React', 'TypeScript', 'Node.js'],
      niceToHaveSkills: ['AWS', 'GraphQL'],
      owner: { name: 'Sarah Chen' },
      account: { name: 'Tech Corp' },
      rate_range: '$90 - $110 / hr',
      createdAt: new Date().toISOString(),
    };
  }

  if (definition.dataSource?.type === 'list' && definition.entityType === 'job') {
    return {
      items: [
        { id: '1', title: 'Senior React Dev', status: 'open', location: 'Remote', account: { name: 'Startup Inc' }, jobType: 'Contract' },
        { id: '2', title: 'Node.js Backend', status: 'urgent', location: 'NY', account: { name: 'Bank Co' }, jobType: 'Permanent' },
      ],
      total: 2,
    };
  }

  if (definition.dataSource?.type === 'list' && definition.entityType === 'talent') {
    return {
      items: [
        { id: '1', fullName: 'John Smith', professionalHeadline: 'Senior Dev', status: 'active', location: 'SF', skills: ['React', 'Node'] },
        { id: '2', fullName: 'Jane Doe', professionalHeadline: 'UX Designer', status: 'placed', location: 'Austin', skills: ['Figma', 'CSS'] },
      ],
      total: 2,
    };
  }

  // Default empty
  return {};
}

interface ScreenPageProps {
  definition: ScreenDefinition;
  params?: Record<string, string>;
  searchParams?: Record<string, string>;
}

export function ScreenPage({ definition, params = {}, searchParams = {} }: ScreenPageProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    
    fetchScreenData(definition, params, searchParams)
      .then(result => {
        if (mounted) {
          setData(result);
          setLoading(false);
        }
      })
      .catch(err => {
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { mounted = false; };
  }, [definition.id, JSON.stringify(params)]);

  if (error) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-red-600 font-bold">Error loading screen</h2>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  // Render
  return (
    <ScreenRenderer
      definition={definition}
      entity={data}
      isLoading={loading}
      context={{
        params,
        query: searchParams,
        user: { id: 'current-user', email: 'demo@test.com', fullName: 'Demo User', role: 'recruiter', permissions: [] },
        computed: new Map(),
      }}
    />
  );
}

