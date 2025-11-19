/**
 * DATABASE TABLE TEMPLATE
 *
 * Copy this template when creating a new table.
 * Follow ADR-002: Standard Database Schema Patterns
 *
 * @see docs/adrs/ADR-002-standard-schema-patterns.md
 */

import { pgTable, uuid, text, timestamp, jsonb, boolean, integer } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users'
import { orgs } from './orgs'

/**
 * STEP 1: Replace [ENTITY_NAME] with your table name (plural, lowercase)
 * Examples: candidates, jobs, submissions, training_modules
 */
export const [ENTITY_NAME] = pgTable('[ENTITY_NAME]', {
  // ==========================================
  // PRIMARY KEY (Required on ALL tables)
  // ==========================================
  id: uuid('id').defaultRandom().primaryKey(),

  // ==========================================
  // BUSINESS FIELDS
  // Customize these for your specific entity
  // ==========================================

  // Example text fields
  name: text('name').notNull(),
  description: text('description'),

  // Example optional fields
  email: text('email'), // Add .unique() if unique
  phone: text('phone'),

  // Example enums (define enum separately)
  // status: userRoleEnum('status').notNull().default('active'),

  // Example numbers
  // age: integer('age'),
  // score: integer('score').default(0),

  // Example booleans
  // isActive: boolean('is_active').default(true),
  // isVerified: boolean('is_verified').default(false),

  // Example JSONB (for flexible data)
  // metadata: jsonb('metadata').$type<{
  //   key1: string
  //   key2: number
  // }>(),

  // ==========================================
  // FOREIGN KEYS
  // Add references to other tables
  // ==========================================

  // Example foreign key (customize onDelete based on business logic)
  // userId: uuid('user_id')
  //   .references(() => users.id, { onDelete: 'cascade' })
  //   .notNull(),

  // onDelete options:
  // - 'cascade'   : Delete this record when parent is deleted
  // - 'set null'  : Set this field to null when parent is deleted
  // - 'restrict'  : Prevent parent deletion if this record exists

  // ==========================================
  // AUDIT TRAIL (Required on ALL tables)
  // ==========================================
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),

  createdBy: uuid('created_by')
    .references(() => users.id),

  updatedBy: uuid('updated_by')
    .references(() => users.id),

  // ==========================================
  // SOFT DELETE (Required on ALL tables)
  // ==========================================
  deletedAt: timestamp('deleted_at', { withTimezone: true }),

  // ==========================================
  // MULTI-TENANCY (Required on ALL tables)
  // ==========================================
  orgId: uuid('org_id')
    .references(() => orgs.id, { onDelete: 'cascade' })
    .notNull(),
})

/**
 * STEP 2: Define relations
 */
export const [ENTITY_NAME]Relations = relations([ENTITY_NAME], ({ one, many }) => ({
  // Relation to organization (standard)
  org: one(orgs, {
    fields: [[ENTITY_NAME].orgId],
    references: [orgs.id],
  }),

  // Relation to creators/updaters (standard)
  createdByUser: one(users, {
    fields: [[ENTITY_NAME].createdBy],
    references: [users.id],
  }),
  updatedByUser: one(users, {
    fields: [[ENTITY_NAME].updatedBy],
    references: [users.id],
  }),

  // Add your custom relations here
  // Example one-to-many:
  // children: many(childTable),

  // Example many-to-one:
  // parent: one(parentTable, {
  //   fields: [[ENTITY_NAME].parentId],
  //   references: [parentTable.id],
  // }),
}))

/**
 * STEP 3: Export TypeScript types
 */
export type [EntityName] = typeof [ENTITY_NAME].$inferSelect
export type New[EntityName] = typeof [ENTITY_NAME].$inferInsert

/**
 * STEP 4: Create migration with RLS policies
 *
 * Run: pnpm drizzle-kit generate:pg
 *
 * Then manually add RLS policies to the generated migration:
 *
 * ```sql
 * -- Enable RLS
 * ALTER TABLE [ENTITY_NAME] ENABLE ROW LEVEL SECURITY;
 *
 * -- Policy: SELECT (read)
 * CREATE POLICY "Users can view own org data"
 *   ON [ENTITY_NAME]
 *   FOR SELECT
 *   USING (org_id = auth.jwt() ->> 'org_id');
 *
 * -- Policy: INSERT (create)
 * CREATE POLICY "Users can insert own org data"
 *   ON [ENTITY_NAME]
 *   FOR INSERT
 *   WITH CHECK (org_id = auth.jwt() ->> 'org_id');
 *
 * -- Policy: UPDATE (modify)
 * CREATE POLICY "Users can update own org data"
 *   ON [ENTITY_NAME]
 *   FOR UPDATE
 *   USING (org_id = auth.jwt() ->> 'org_id')
 *   WITH CHECK (org_id = auth.jwt() ->> 'org_id');
 *
 * -- No DELETE policy = soft deletes only
 *
 * -- Trigger for updated_at
 * CREATE TRIGGER update_[ENTITY_NAME]_updated_at
 *   BEFORE UPDATE ON [ENTITY_NAME]
 *   FOR EACH ROW
 *   EXECUTE FUNCTION update_updated_at_column();
 * ```
 *
 * STEP 5: Create helper functions (optional)
 *
 * @see src/lib/db/queries/[ENTITY_NAME].ts
 * @see src/lib/db/mutations/[ENTITY_NAME].ts
 */

/**
 * CHECKLIST (Before committing):
 *
 * [ ] Table name is plural (candidates, not candidate)
 * [ ] All standard fields present (id, createdAt, updatedAt, deletedAt, createdBy, updatedBy, orgId)
 * [ ] Foreign keys have explicit onDelete behavior
 * [ ] Timestamps use { withTimezone: true }
 * [ ] Relations defined
 * [ ] Types exported (Select, Insert)
 * [ ] Migration generated (pnpm drizzle-kit generate:pg)
 * [ ] RLS policies added to migration
 * [ ] Tested locally (can insert, update, query)
 * [ ] Verified org isolation works (RLS test)
 */
