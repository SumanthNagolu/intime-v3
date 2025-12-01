/**
 * Submission Pipeline Page
 * 
 * Uses metadata-driven ScreenRenderer for the pipeline (Kanban) UI.
 * @see src/screens/recruiting/submission-pipeline.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { submissionPipelineScreen } from '@/screens/recruiting';
import { AppLayout } from '@/components/AppLayout';
import { RecruitingLayout } from '@/components/layouts/RecruitingLayout';

export const dynamic = "force-dynamic";

function PipelineSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="flex gap-4 overflow-x-auto">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex-shrink-0 w-72 h-96 bg-stone-200 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function SubmissionPipelinePage() {
  return (
    <AppLayout>
      <RecruitingLayout>
        <Suspense fallback={<PipelineSkeleton />}>
          <ScreenRenderer definition={submissionPipelineScreen} />
        </Suspense>
      </RecruitingLayout>
    </AppLayout>
  );
}
