/**
 * Layout Components for InTime v3
 *
 * Based on 01-LAYOUT-SHELL.md specification
 * Provides application shell, navigation, and page layouts
 */

// Main layouts
export { AppShell } from './AppShell';
export { WorkspaceLayout } from './WorkspaceLayout';
export { AuthLayout } from './AuthLayout';
export { PortalLayout } from './PortalLayout';

// Module-specific layouts
export { AdminLayout } from './AdminLayout';
export { RecruitingLayout } from './RecruitingLayout';
export { BenchLayout } from './BenchLayout';
export { HRLayout } from './HRLayout';
export { TALayout } from './TALayout';
export { AcademyLayout } from './AcademyLayout';
export { CEOLayout } from './CEOLayout';
export { EmployeeLayout } from './EmployeeLayout';
export { ImmigrationLayout } from './ImmigrationLayout';
export { SharedLayout } from './SharedLayout';

// Header components
export { Header, UserMenu, NotificationsDropdown } from './header';

// Sidebar components
export {
  Sidebar,
  SidebarHeader,
  SidebarSection,
  SidebarNavItem,
  SidebarPinnedItems,
  SidebarRecentItems,
  SidebarCollapseButton,
} from './sidebar';

// Command bar
export { CommandBar } from './command';

// Page layouts
export {
  PageLayout,
  DashboardLayout,
  StatCard,
  WelcomeBanner,
  ListLayout,
  DetailLayout,
  SplitPaneLayout,
} from './pages';

// Content layouts
export {
  GridLayout,
  StackLayout,
  TabsLayout,
  CardGridLayout,
  AccordionLayout,
} from './content';

// Responsive utilities
export {
  ResponsiveContainer,
  ShowAt,
  HideAt,
  MobileNav,
} from './responsive';

// Quick Actions
export { QuickActions, getQuickActionsForPath, hasQuickActions } from './QuickActions';
