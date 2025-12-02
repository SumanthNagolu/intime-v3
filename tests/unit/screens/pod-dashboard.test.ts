import { describe, it, expect } from 'vitest';
import { podDashboardScreen } from '@/screens/operations/pod-dashboard.screen';

describe('Pod Dashboard Screen', () => {
  it('should be a dashboard type', () => {
    expect(podDashboardScreen.id).toBe('pod-dashboard');
    expect(podDashboardScreen.type).toBe('dashboard');
  });

  it('should show sprint progress', () => {
    expect(podDashboardScreen.layout).toBeDefined();
    const sprintSection = podDashboardScreen.layout?.sections?.find(s => s.id === 'sprint-progress');
    expect(sprintSection).toBeDefined();
    expect(sprintSection?.type).toBe('metrics-grid');
  });

  it('should show individual performance table', () => {
    expect(podDashboardScreen.layout).toBeDefined();
    const icTable = podDashboardScreen.layout?.sections?.find(s => s.id === 'individual-performance');
    expect(icTable).toBeDefined();
    expect(icTable?.type).toBe('table');
    const columns = icTable?.columns_config?.map(c => c.id) || [];
    expect(columns).toContain('name');
    expect(columns).toContain('sprint-progress');
    expect(columns).toContain('pipeline-health');
  });

  it('should show escalations queue', () => {
    expect(podDashboardScreen.layout).toBeDefined();
    const escalations = podDashboardScreen.layout?.sections?.find(s => s.id === 'escalations');
    expect(escalations).toBeDefined();
    expect(escalations?.title).toContain('Escalations');
  });
});

