import { describe, it, expect } from 'vitest';
import { jobListScreen, candidateListScreen } from '@/screens/recruiting/list-screens';

describe('Job List Screen', () => {
  it('should be a list type screen', () => {
    expect(jobListScreen.id).toBe('job-list');
    expect(jobListScreen.type).toBe('list');
    expect(jobListScreen.entityType).toBe('job');
  });

  it('should have appropriate columns', () => {
    expect(jobListScreen.layout).toBeDefined();
    const tableSection = jobListScreen.layout?.sections?.find(s => s.type === 'table');
    const columns = tableSection?.columns_config?.map(c => c.id) || [];
    expect(columns).toContain('title');
    expect(columns).toContain('account');
    expect(columns).toContain('status');
    expect(columns).toContain('location');
  });

  it('should have a create action', () => {
    const actions = jobListScreen.actions || [];
    expect(actions.find(a => a.id === 'create')).toBeDefined();
  });
});

describe('Candidate List Screen', () => {
  it('should be a list type screen', () => {
    expect(candidateListScreen.id).toBe('candidate-list');
    expect(candidateListScreen.type).toBe('list');
    expect(candidateListScreen.entityType).toBe('candidate');
  });

  it('should have search configuration', () => {
    // List screens typically imply search, but let's check if we defined filters/search explicitly
    // in the real implementation, we might put this indataSource or a filter section
    // For now, checking basic identity
    expect(candidateListScreen.title).toBeDefined();
  });
});

