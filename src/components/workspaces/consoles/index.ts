/**
 * Role-Specific Consoles
 *
 * Context-aware console views for different user roles
 * Part of the Unified Workspace Architecture
 *
 * Console Types:
 * - IC Consoles: RecruiterConsole, BenchSalesConsole, TAConsole
 * - Manager Console: Adaptive for Recruiting/Bench/TA managers
 * - Executive Consoles: CEOConsole, COOConsole, CFOConsole
 * - Admin Console: System administration
 * - HR Console: People operations
 * - Executive Console: Legacy/generic executive view
 */

// Individual Contributor Consoles
export { RecruiterConsole } from './RecruiterConsole';
export { BenchSalesConsole } from './BenchSalesConsole';
export { TAConsole } from './TAConsole';

// Manager Console (adaptive for 3 manager types)
export { ManagerConsole, type ManagerType, type ManagerConsoleProps } from './ManagerConsole';

// Executive/C-Suite Consoles
export { ExecutiveConsole } from './ExecutiveConsole';
export { CEOConsole } from './CEOConsole';
export { COOConsole } from './COOConsole';
export { CFOConsole } from './CFOConsole';

// Functional Consoles
export { HRConsole } from './HRConsole';
export { AdminConsole } from './AdminConsole';
