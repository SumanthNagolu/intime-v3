import { describe, it, expect } from 'vitest';
import { financeDashboardScreen, invoiceListScreen } from '@/screens/finance/finance-screens';

describe('Finance Dashboard Screen', () => {
  it('should be a dashboard type', () => {
    expect(financeDashboardScreen.id).toBe('finance-dashboard');
    expect(financeDashboardScreen.type).toBe('dashboard');
  });

  it('should show revenue metrics', () => {
    const metricsSection = financeDashboardScreen.layout.sections?.find(s => s.type === 'metrics-grid');
    const widgetIds = metricsSection?.widgets?.map(w => w.id) || [];
    expect(widgetIds).toContain('total-revenue');
    expect(widgetIds).toContain('outstanding-invoices');
  });
});

describe('Invoice List Screen', () => {
  it('should be a list type', () => {
    expect(invoiceListScreen.id).toBe('invoice-list');
    expect(invoiceListScreen.type).toBe('list');
  });

  it('should have generate invoice action', () => {
    const actions = invoiceListScreen.actions || [];
    expect(actions.find(a => a.id === 'generate-invoice')).toBeDefined();
  });
});

