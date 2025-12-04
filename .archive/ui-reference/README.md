# UI Reference Archive

**Archived**: 2025-12-03
**Purpose**: Reference files for clean UI rebuild

This archive contains the previous UI implementation for reference while building new screens from specs.

## Contents

| Directory | Description | Use Case |
|-----------|-------------|----------|
| `screens/` | Screen definitions (.screen.ts) | Reference for metadata patterns |
| `renderers/` | ScreenRenderer, LayoutRenderer, etc. | Rendering pipeline reference |
| `widgets/` | Display and input widgets | Widget implementation patterns |
| `types/` | TypeScript type definitions | Type structure reference |
| `registry/` | Widget registry system | Registration patterns |
| `layouts/` | Role-specific layouts | Navigation structure |
| `forms/` | Form components and hooks | Form patterns |
| `navigation/` | Navigation configuration | Route structure |
| `validations/` | Zod validation schemas | Schema patterns |
| `component-renderers/` | Domain-specific renderers | Custom renderer patterns |

## Key Files for Reference

### Screen Definition Pattern
```
screens/recruiting/recruiter-dashboard.screen.ts
screens/crm/account-list.screen.ts
screens/admin/admin-dashboard.screen.ts
```

### Renderer Pipeline
```
renderers/ScreenRenderer.tsx     - Top-level orchestrator
renderers/LayoutRenderer.tsx     - Layout type handling
renderers/SectionRenderer.tsx    - Section rendering
renderers/WidgetRenderer.tsx     - Field/widget rendering
renderers/ListRenderer.tsx       - List screens with data fetching
```

### Form System
```
forms/FormField.tsx              - 20+ field types
forms/FormSection.tsx            - Collapsible sections
forms/FormStepper.tsx            - Multi-step wizards
forms/validation.ts              - Common validators
forms/transformers.ts            - Data transformation
```

### Navigation
```
navigation/navConfig.ts          - Role-based navigation (1346 lines)
navigation/types.ts              - Navigation types
layouts/RecruitingLayout.tsx     - Full layout example (1206 lines)
```

### Validation Schemas
```
validations/ats.ts               - Jobs, submissions, placements (1041 lines)
validations/crm.ts               - Accounts, leads, deals (283 lines)
```

## Rebuild Approach

1. **Forms First**: Use `validations/` schemas as starting point for Zod schemas
2. **User Flows**: Reference `navigation/navConfig.ts` for route structure
3. **Screens**: Reference `screens/` for metadata patterns

## Related Documentation

- Research: `thoughts/shared/research/2025-12-03-ui-cleanup-architecture-reference.md`
- Specs: `docs/specs/` (282 database specs, 113 workflow specs)
