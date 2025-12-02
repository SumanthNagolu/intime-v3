# immigration_attorneys Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `immigration_attorneys` |
| Schema | `public` |
| Purpose | Maintains directory of immigration attorneys and law firms that handle cases for the organization |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key, unique attorney identifier |
| org_id | uuid | NO | - | Organization this attorney record belongs to |
| name | text | NO | - | Attorney's full name |
| firm | text | YES | - | Law firm name |
| email | text | YES | - | Attorney's email address |
| phone | text | YES | - | Attorney's phone number |
| specialization | text[] | YES | - | Array of immigration specializations (H1B, Green Card, etc.) |
| rating | numeric | YES | - | Performance rating (e.g., 1-5 scale) |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| org_id | organizations.id | Organization that works with this attorney |

## Indexes

| Index Name | Definition |
|------------|------------|
| immigration_attorneys_pkey | CREATE UNIQUE INDEX immigration_attorneys_pkey ON public.immigration_attorneys USING btree (id) |
| idx_immigration_attorneys_org_id | CREATE INDEX idx_immigration_attorneys_org_id ON public.immigration_attorneys USING btree (org_id) |

## Business Logic

### Attorney Specializations
The `specialization` array can include:
- `H1B` - H1B visa transfers, extensions, amendments
- `Green Card` - PERM, I-140, I-485 processes
- `L1` - L1 visa cases
- `TN` - TN visa cases (NAFTA)
- `OPT/CPT` - Student work authorizations
- `PERM` - Labor certification specialist
- `I-485` - Adjustment of status specialist
- `RFE Response` - Request for Evidence expertise

### Rating System
- Attorney performance can be rated (typically 1-5 scale)
- Used for selecting attorneys for new cases
- Based on factors like:
  - Success rate
  - Response time
  - Communication quality
  - Cost effectiveness

### Key Features
- **Multi-specialization**: Attorneys can have multiple areas of expertise
- **Firm tracking**: Associates attorney with their law firm
- **Contact information**: Email and phone for case coordination
- **Performance metrics**: Rating helps choose best attorney for case type

### Use Cases
1. **Attorney Assignment**: Select attorney when creating new immigration case
2. **Specialization Matching**: Filter attorneys by case type expertise
3. **Performance Tracking**: Monitor attorney success rates and ratings
4. **Contact Management**: Maintain up-to-date communication channels
