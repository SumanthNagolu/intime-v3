import { describe, it, expect } from 'vitest';
import { hrDashboardScreen, employeeListScreen, employeeDetailScreen } from '@/screens/hr/hr-screens';

describe('HR Dashboard Screen', () => {
  it('should be a dashboard type', () => {
    expect(hrDashboardScreen.id).toBe('hr-dashboard');
    expect(hrDashboardScreen.type).toBe('dashboard');
  });

  it('should have key HR metrics', () => {
    const metricsSection = hrDashboardScreen.layout.sections?.find(s => s.type === 'metrics-grid');
    const widgetIds = metricsSection?.widgets?.map(w => w.id) || [];
    
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
    expect(actions.find(a => a.id === 'add-employee')).toBeDefined();
  });
});

describe('Employee Detail Screen', () => {
  it('should be a detail type', () => {
    expect(employeeDetailScreen.id).toBe('employee-detail');
    expect(employeeDetailScreen.type).toBe('detail');
  });

  it('should have compensation and benefits sections', () => {
    const compTab = employeeDetailScreen.layout.tabs?.find(t => t.id === 'compensation');
    expect(compTab).toBeDefined();
    expect(compTab?.sections.find(s => s.id === 'salary-info')).toBeDefined();
  });
});

