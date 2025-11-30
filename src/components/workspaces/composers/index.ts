/**
 * Workspace Composers
 *
 * High-level components that compose tabs, sections, and modals
 * into complete workspace experiences.
 */

export { GenericEntityWorkspace } from './GenericEntityWorkspace';
export type {
  GenericEntityWorkspaceProps,
  WorkspaceTab,
  WorkspaceAction,
} from './GenericEntityWorkspace';

export {
  DEFAULT_TABS,
  getTabsForEntity,
  buildWorkspaceTabs,
  buildJobTabs,
  buildTalentTabs,
  buildSubmissionTabs,
} from './TabRegistry';
export type {
  TabDefinition,
  TabConfig,
  JobTabsContentMap,
  TalentTabsContentMap,
  SubmissionTabsContentMap,
} from './TabRegistry';
