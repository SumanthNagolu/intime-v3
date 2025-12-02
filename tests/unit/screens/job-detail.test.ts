import { describe, it, expect } from 'vitest';
import { jobDetailScreen } from '@/screens/recruiting/job-detail.screen';
import { ScreenDefinition } from '@/lib/metadata/types';

describe('Job Detail Screen Definition', () => {
  it('should have the correct ID and type', () => {
    expect(jobDetailScreen.id).toBe('job-detail');
    expect(jobDetailScreen.type).toBe('detail');
    expect(jobDetailScreen.entityType).toBe('job');
  });

  it('should have a title field', () => {
    expect(jobDetailScreen.title).toEqual({ type: 'field', path: 'title' });
  });

  it('should have the correct data source', () => {
    expect(jobDetailScreen.dataSource).toEqual({
      type: 'entity',
      entityType: 'job',
      entityId: { type: 'param', path: 'id' },
    });
  });

  it('should have a sidebar-main layout', () => {
    expect(jobDetailScreen.layout).toBeDefined();
    expect(jobDetailScreen.layout?.type).toBe('sidebar-main');
  });

  it('should have key sections in the main area', () => {
    expect(jobDetailScreen.layout).toBeDefined();
    const mainTabs = jobDetailScreen.layout?.tabs || [];
    expect(mainTabs).toBeDefined();

    // Check for Details tab
    const detailsTab = mainTabs.find(t => t.id === 'details');
    expect(detailsTab).toBeDefined();
    expect(detailsTab?.label).toBe('Details');

    // Check for Pipeline tab
    const pipelineTab = mainTabs.find(t => t.id === 'pipeline');
    expect(pipelineTab).toBeDefined();
    expect(pipelineTab?.label).toBe('Pipeline');
  });

  it('should use the JobDetailsInputSet in the summary section', () => {
    expect(jobDetailScreen.layout).toBeDefined();
    const detailsTab = jobDetailScreen.layout?.tabs?.find(t => t.id === 'details');
    const summarySection = detailsTab?.sections.find(s => s.id === 'summary');

    expect(summarySection).toBeDefined();
    expect(summarySection?.type).toBe('input-set');
    // We expect it to reference a reusable input set
    expect(summarySection?.inputSet).toBe('JobDetailsInputSet');
  });

  it('should have appropriate actions', () => {
    const actionIds = jobDetailScreen.actions?.map(a => a.id);
    expect(actionIds).toContain('edit');
    expect(actionIds).toContain('submit-candidate');
    expect(actionIds).toContain('close-job');
  });
});

