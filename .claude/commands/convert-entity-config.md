# Convert Entity - Step 1: Entity Configuration

Create the entity configuration file that serves as the **single source of truth** for backend, frontend, and testing.

## Usage
```
/convert-entity-config [entity-name]
```

## Examples
```
/convert-entity-config lead
/convert-entity-config job
/convert-entity-config submission
```

---

## What This Command Does

1. Analyzes existing database schema for the entity
2. Creates comprehensive entity config file
3. Defines all fields, types, relations, and validation rules
4. Sets up workplan configuration (for root entities)

**Output:** `src/lib/entities/[domain]/[entity].entity.ts`

---

## Entity Categories

First, identify the category:

| Category | Entities | Has Workplan |
|----------|----------|--------------|
| **Root** | lead, job, submission, deal, placement | Yes |
| **Supporting** | account, contact, candidate, interview, offer | No |

---

## Step 1: Analyze Database Schema

Check the existing database schema:

```sql
-- Get table columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = '[table_name]'
ORDER BY ordinal_position;

-- Get foreign keys
SELECT
  kcu.column_name,
  ccu.table_name AS foreign_table
FROM information_schema.key_column_usage kcu
JOIN information_schema.constraint_column_usage ccu
  ON kcu.constraint_name = ccu.constraint_name
WHERE kcu.table_name = '[table_name]';

-- Get indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = '[table_name]';
```

Also check the Drizzle schema: `src/lib/db/schema/[domain].ts`

---

## Step 2: Create Entity Config

Create file: `src/lib/entities/[domain]/[entity].entity.ts`

```typescript
import type { EntityConfig } from '../types';

export const [entity]Entity: EntityConfig = {
  // ==========================================
  // IDENTITY
  // ==========================================
  name: '[entity]',
  displayName: '[Entity]',
  pluralName: '[Entities]',

  // Entity category
  category: 'root', // or 'supporting'

  // ==========================================
  // DATABASE
  // ==========================================
  tableName: '[table_name]',
  schema: 'public',

  // ==========================================
  // TRPC ROUTER
  // ==========================================
  router: '[domain]', // 'crm', 'ats', 'bench', 'academy'

  procedures: {
    getById: 'get[Entity]ById',
    list: 'list[Entities]',
    create: 'create[Entity]',
    update: 'update[Entity]',
    delete: 'delete[Entity]',
    // Entity-specific procedures
    // convert: 'convert[Entity]',
    // bulkUpdate: 'bulkUpdate[Entities]',
  },

  // ==========================================
  // WORKPLAN (Root Entities Only)
  // ==========================================
  workplan: {
    templateCode: '[entity]_workflow',
    triggerOnCreate: true,
    triggerOnStatusChange: true,
  },

  // ==========================================
  // FIELDS
  // Map ALL database columns
  // ==========================================
  fields: {
    // --- Primary Key ---
    id: {
      type: 'uuid',
      primaryKey: true,
      label: 'ID',
      internal: true,
    },

    // --- Organization (Multi-tenant) ---
    orgId: {
      type: 'uuid',
      required: true,
      internal: true,
      label: 'Organization',
    },

    // --- Core Fields ---
    // Example for Lead:
    companyName: {
      type: 'text',
      required: true,
      label: 'Company Name',
      maxLength: 255,
      searchable: true,
    },

    status: {
      type: 'enum',
      required: true,
      label: 'Status',
      options: [
        { value: 'new', label: 'New' },
        { value: 'contacted', label: 'Contacted' },
        { value: 'qualified', label: 'Qualified' },
        { value: 'converted', label: 'Converted' },
        { value: 'lost', label: 'Lost' },
      ],
      default: 'new',
    },

    // --- Contact Fields ---
    firstName: {
      type: 'text',
      label: 'First Name',
      maxLength: 100,
    },

    lastName: {
      type: 'text',
      label: 'Last Name',
      maxLength: 100,
    },

    email: {
      type: 'email',
      label: 'Email',
      searchable: true,
    },

    phone: {
      type: 'phone',
      label: 'Phone',
    },

    // --- Reference Fields ---
    ownerId: {
      type: 'uuid',
      label: 'Owner',
      references: {
        entity: 'userProfile',
        field: 'id',
        display: 'fullName',
      },
    },

    accountId: {
      type: 'uuid',
      label: 'Account',
      references: {
        entity: 'account',
        field: 'id',
        display: 'name',
      },
    },

    // --- Numeric Fields ---
    estimatedValue: {
      type: 'currency',
      label: 'Estimated Value',
      min: 0,
    },

    // --- Date Fields ---
    expectedCloseDate: {
      type: 'date',
      label: 'Expected Close Date',
    },

    // --- JSON Fields ---
    metadata: {
      type: 'json',
      label: 'Metadata',
      internal: true,
    },

    // --- Audit Fields (Auto-managed) ---
    createdAt: {
      type: 'timestamp',
      label: 'Created',
      auto: true,
    },

    updatedAt: {
      type: 'timestamp',
      label: 'Updated',
      auto: true,
    },

    createdBy: {
      type: 'uuid',
      label: 'Created By',
      auto: true,
      references: {
        entity: 'userProfile',
        field: 'id',
      },
    },

    updatedBy: {
      type: 'uuid',
      label: 'Updated By',
      auto: true,
      references: {
        entity: 'userProfile',
        field: 'id',
      },
    },

    deletedAt: {
      type: 'timestamp',
      label: 'Deleted',
      softDelete: true,
    },
  },

  // ==========================================
  // RELATIONS
  // ==========================================
  relations: {
    owner: {
      type: 'belongsTo',
      entity: 'userProfile',
      field: 'ownerId',
    },
    account: {
      type: 'belongsTo',
      entity: 'account',
      field: 'accountId',
    },
    activities: {
      type: 'hasMany',
      entity: 'activity',
      foreignKey: 'entityId',
      polymorphic: true, // Uses entityType + entityId
    },
    // deals: {
    //   type: 'hasMany',
    //   entity: 'deal',
    //   foreignKey: 'leadId',
    // },
  },

  // ==========================================
  // INDEXES
  // ==========================================
  indexes: [
    { fields: ['orgId'], name: 'idx_[table]_org' },
    { fields: ['orgId', 'status'], name: 'idx_[table]_org_status' },
    { fields: ['orgId', 'ownerId'], name: 'idx_[table]_org_owner' },
    { fields: ['orgId', 'createdAt'], name: 'idx_[table]_org_created' },
  ],

  // ==========================================
  // SEARCH & DISPLAY
  // ==========================================
  searchFields: ['companyName', 'email', 'firstName', 'lastName'],

  defaultSort: {
    field: 'createdAt',
    direction: 'desc',
  },

  // Display functions (for lists, references)
  display: {
    title: (entity) => entity.companyName || `${entity.firstName} ${entity.lastName}`,
    subtitle: (entity) => entity.email,
    badge: (entity) => entity.status,
  },

  // ==========================================
  // UI CONFIGURATION
  // ==========================================
  ui: {
    // List page configuration
    list: {
      columns: ['companyName', 'status', 'owner', 'estimatedValue', 'createdAt'],
      filters: ['status', 'owner', 'tier', 'source'],
      defaultPageSize: 25,
    },

    // Detail page tabs
    detail: {
      tabs: [
        {
          id: 'overview',
          label: 'Overview',
          sections: ['companyInfo', 'contactInfo'],
        },
        {
          id: 'qualification',
          label: 'Qualification',
          sections: ['bantScores'],
        },
        {
          id: 'activity',
          label: 'Activity',
          sections: ['workplanProgress', 'activityTimeline'],
        },
      ],
    },

    // Field groupings for forms
    fieldGroups: [
      {
        id: 'companyInfo',
        label: 'Company Information',
        fields: ['companyName', 'industry', 'companyType', 'tier', 'website'],
      },
      {
        id: 'contactInfo',
        label: 'Contact Information',
        fields: ['firstName', 'lastName', 'email', 'phone', 'title'],
      },
      {
        id: 'bantScores',
        label: 'BANT Qualification',
        fields: ['bantBudget', 'bantAuthority', 'bantNeed', 'bantTimeline'],
      },
    ],
  },
};

// Export type for use elsewhere
export type [Entity] = typeof [entity]Entity;
```

---

## Step 3: Verify Configuration

### Checklist

**Identity:**
- [ ] `name` matches entity name (lowercase)
- [ ] `displayName` is human-readable singular
- [ ] `pluralName` is human-readable plural
- [ ] `category` is correct (root/supporting)

**Database:**
- [ ] `tableName` matches actual database table
- [ ] All database columns are mapped to fields

**Fields:**
- [ ] All columns have corresponding field entries
- [ ] Field types match database types
- [ ] Required fields marked with `required: true`
- [ ] Enum fields have `options` array
- [ ] Reference fields have `references` config
- [ ] Audit fields marked with `auto: true`
- [ ] `deletedAt` marked with `softDelete: true`

**Relations:**
- [ ] All foreign keys have relation entries
- [ ] Relation types are correct (belongsTo, hasMany)
- [ ] Polymorphic relations marked appropriately

**Workplan (Root entities only):**
- [ ] `workplan.templateCode` defined
- [ ] Template exists in database (or will be created)

**UI Configuration:**
- [ ] List columns defined
- [ ] List filters defined
- [ ] Detail tabs defined
- [ ] Field groups defined

---

## Step 4: Export from Index

Add to `src/lib/entities/[domain]/index.ts`:

```typescript
export * from './[entity].entity';
```

Add to `src/lib/entities/index.ts`:

```typescript
export * from './[domain]';
```

---

## Step 5: Commit Checkpoint

```bash
git add src/lib/entities/
git commit -m "feat([domain]): add [entity] entity configuration

- Define all fields with types and validation
- Configure relations and indexes
- Set up workplan template reference
- Configure UI display settings

🤖 Generated with Claude Code"
```

---

## Next Steps

After this command completes and is committed:

```bash
/convert-entity-backend [entity]  # Generate backend from config
/convert-entity-ui [entity]       # Generate frontend + tests from config
```

---

## Field Type Reference

| Database Type | Entity Config Type | Notes |
|---------------|-------------------|-------|
| `uuid` | `uuid` | |
| `text` | `text` | Add `maxLength` if needed |
| `text` (long) | `textarea` | For descriptions, notes |
| `varchar(n)` | `text` | Set `maxLength: n` |
| `integer` | `number` | |
| `numeric` | `currency` | For money values |
| `boolean` | `boolean` | |
| `timestamp` | `timestamp` | |
| `date` | `date` | |
| `jsonb` | `json` | |
| `text[]` | `tags` | Array of strings |
| `text` (enum) | `enum` | Add `options` array |
| `uuid` (FK) | `uuid` | Add `references` config |
