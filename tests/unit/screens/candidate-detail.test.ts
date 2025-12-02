import { describe, it, expect } from 'vitest';
import { candidateDetailScreen } from '@/screens/recruiting/candidate-detail.screen';

describe('Candidate Detail Screen Definition', () => {
  it('should have the correct ID and type', () => {
    expect(candidateDetailScreen.id).toBe('candidate-detail');
    expect(candidateDetailScreen.type).toBe('detail');
    expect(candidateDetailScreen.entityType).toBe('candidate');
  });

  it('should have a sidebar-main layout', () => {
    expect(candidateDetailScreen.layout).toBeDefined();
    expect(candidateDetailScreen.layout?.type).toBe('sidebar-main');
  });

  it('should have key tabs', () => {
    expect(candidateDetailScreen.layout).toBeDefined();
    const tabs = candidateDetailScreen.layout?.tabs || [];
    const tabIds = tabs.map(t => t.id);
    expect(tabIds).toContain('overview');
    expect(tabIds).toContain('activity');
    expect(tabIds).toContain('documents');
  });

  it('should have basic info in sidebar', () => {
    expect(candidateDetailScreen.layout).toBeDefined();
    const sidebar = candidateDetailScreen.layout?.sidebar;
    expect(sidebar).toBeDefined();
    expect(sidebar?.type).toBe('info-card');
    const fields = sidebar?.fields?.map(f => f.path) || [];

    expect(fields).toContain('email');
    expect(fields).toContain('phone');
    expect(fields).toContain('location');
    expect(fields).toContain('status');
  });

  it('should use CandidateProfileInputSet', () => {
    expect(candidateDetailScreen.layout).toBeDefined();
    const overviewTab = candidateDetailScreen.layout?.tabs?.find(t => t.id === 'overview');
    const profileSection = overviewTab?.sections.find(s => s.id === 'profile');

    expect(profileSection).toBeDefined();
    expect(profileSection?.type).toBe('input-set');
    expect(profileSection?.inputSet).toBe('CandidateProfileInputSet');
  });

  it('should have appropriate actions', () => {
    const actions = candidateDetailScreen.actions || [];
    const actionIds = actions.map(a => a.id);
    
    expect(actionIds).toContain('edit');
    expect(actionIds).toContain('submit-to-job');
    expect(actionIds).toContain('log-activity');
  });
});

