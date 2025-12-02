# immigration_timelines Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `immigration_timelines` |
| Schema | `public` |
| Purpose | Tracks key milestones and deadlines for each immigration case with target and actual completion dates |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key, unique timeline entry identifier |
| case_id | uuid | NO | - | Immigration case this milestone belongs to |
| milestone | text | NO | - | Name/description of the milestone |
| target_date | date | YES | - | Planned/expected completion date |
| actual_date | date | YES | - | Actual completion date (when milestone is achieved) |
| status | text | NO | 'pending' | Current status of the milestone |
| notes | text | YES | - | Additional notes about the milestone |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| case_id | immigration_cases.id | Associated immigration case |

## Indexes

| Index Name | Definition |
|------------|------------|
| immigration_timelines_pkey | CREATE UNIQUE INDEX immigration_timelines_pkey ON public.immigration_timelines USING btree (id) |
| idx_immigration_timelines_case_id | CREATE INDEX idx_immigration_timelines_case_id ON public.immigration_timelines USING btree (case_id) |

## Business Logic

### Common Milestones

#### H1B Transfer/Extension
- `LCA Filing` - Labor Condition Application submission
- `I-129 Filing` - H1B petition filing
- `Receipt Notice` - USCIS receipt confirmation
- `RFE Response` - Request for Evidence response (if applicable)
- `Case Approval` - USCIS approval
- `Visa Stamping` - Visa stamp at consulate (if needed)

#### Green Card (PERM → I-140 → I-485)
- `PERM Audit Response` - Labor cert audit (if applicable)
- `PERM Approval` - Labor certification approved
- `I-140 Filing` - Immigrant petition filing
- `I-140 Approval` - Immigrant petition approved
- `I-485 Filing` - Adjustment of status filing
- `EAD/AP Approval` - Work/travel authorization
- `Interview Scheduled` - AOS interview appointment
- `Green Card Approval` - Final approval

#### OPT Extension
- `Application Submission` - OPT extension application
- `Receipt Notice` - Application acknowledged
- `Approval Notice` - OPT approved
- `EAD Card Received` - Physical card delivery

### Milestone Status Values
- `pending` - Not yet started or in planning
- `in_progress` - Currently being worked on
- `completed` - Successfully achieved
- `delayed` - Behind schedule
- `blocked` - Cannot proceed due to dependency
- `cancelled` - No longer applicable

### Timeline Tracking
1. **Planning**: Milestones created with target_date when case starts
2. **Progress**: Status updated as work progresses
3. **Completion**: actual_date set when milestone achieved
4. **Variance**: Compare target_date vs actual_date for delays

### Alert Integration
- Approaching target_date without completion triggers alerts
- Delayed milestones create notifications
- Critical path milestones prioritized

### Key Features
- **Target vs Actual**: Track planned vs actual completion
- **Status tracking**: Monitor progress of each milestone
- **Notes field**: Document reasons for delays or issues
- **Chronological view**: Orders case progress sequentially
- **Dependency tracking**: Some milestones depend on others

### Use Cases
1. **Case Planning**: Set expected timeline when case begins
2. **Progress Monitoring**: Track which milestones are on schedule
3. **Delay Analysis**: Identify bottlenecks and delays
4. **Client Updates**: Provide status updates based on milestones
5. **Historical Data**: Analyze typical case durations for planning
