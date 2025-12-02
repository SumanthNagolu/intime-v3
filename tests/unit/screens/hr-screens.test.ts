import { describe, it, expect } from 'vitest';
import { hrDashboardScreen, employeeListScreen, employeeDetailScreen } from '@/screens/hr';
import type { SectionDefinition, WidgetDefinition, ActionDefinition, TabDefinition } from '@/lib/metadata/types';

describe('HR Dashboard Screen', () => {
  it('should be a dashboard type', () => {
    expect(hrDashboardScreen.id).toBe('hr-dashboard');
    expect(hrDashboardScreen.type).toBe('dashboard');
  });

  it('should have key HR metrics', () => {
    expect(hrDashboardScreen.layout).toBeDefined();
    const metricsSection = hrDashboardScreen.layout?.sections?.find((s: SectionDefinition) => s.type === 'metrics-grid');
    const widgetIds = metricsSection?.widgets?.map((w: WidgetDefinition) => w.id) || [];

    expect(widgetIds).toContain('total-employees');
    expect(widgetIds).toContain('onboarding-pending');
    expect(widgetIds).toContain('compliance-alerts');
  });
});

describe('Employee List Screen', () => {
  it('should be a list type', () => {
    expect(employeeListScreen.id).toBe('employee-list');
    expect(employeeListScreen.type).toBe('list');
  });

  it('should have add employee action', () => {
    const actions = employeeListScreen.actions || [];
    expect(actions.find((a: ActionDefinition) => a.id === 'add-employee')).toBeDefined();
  });
});

describe('Employee Detail Screen', () => {
  it('should be a detail type', () => {
    expect(employeeDetailScreen.id).toBe('employee-detail');
    expect(employeeDetailScreen.type).toBe('detail');
  });

  it('should have compensation and benefits sections', () => {
    expect(employeeDetailScreen.layout).toBeDefined();
    const compTab = employeeDetailScreen.layout?.tabs?.find((t: TabDefinition) => t.id === 'compensation');
    expect(compTab).toBeDefined();
    expect(compTab?.sections.find((s: SectionDefinition) => s.id === 'salary-info')).toBeDefined();
  });
});

