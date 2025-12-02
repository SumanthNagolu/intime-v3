import { describe, it, expect } from 'vitest';
import { benchDashboardScreen, benchListScreen } from '@/screens/bench/bench-screens';

describe('Bench Dashboard Screen', () => {
  it('should be a dashboard type', () => {
    expect(benchDashboardScreen.id).toBe('bench-dashboard');
    expect(benchDashboardScreen.type).toBe('dashboard');
  });

  it('should have key metrics widgets', () => {
    expect(benchDashboardScreen.layout).toBeDefined();
    const metricsSection = benchDashboardScreen.layout?.sections?.find(s => s.type === 'metrics-grid');
    const widgets = metricsSection?.widgets || [];
    const widgetIds = widgets.map(w => w.id);

    expect(widgetIds).toContain('total-bench');
    expect(widgetIds).toContain('utilization');
    expect(widgetIds).toContain('placements-sprint');
  });

  it('should have a recent activity feed', () => {
    expect(benchDashboardScreen.layout).toBeDefined();
    const activitySection = benchDashboardScreen.layout?.sections?.find(s => s.type === 'timeline');
    expect(activitySection).toBeDefined();
  });
});

describe('Bench List Screen', () => {
  it('should be a list type', () => {
    expect(benchListScreen.id).toBe('bench-list');
    expect(benchListScreen.type).toBe('list');
  });

  it('should have hotlist action', () => {
    expect(benchListScreen.layout).toBeDefined();
    const actions = benchListScreen.layout?.sections?.[0].actions || [];
    const hotlistAction = actions.find(a => a.id === 'add-to-hotlist');
    expect(hotlistAction).toBeDefined();
  });
});

