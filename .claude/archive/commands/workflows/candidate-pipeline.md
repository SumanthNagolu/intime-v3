---
description: Complete candidate-to-placement workflow (Sourcing → Screening → Matching → Placement → Cross-Pollination)
---

I'll route this through our staffing-optimized pipeline designed for InTime's 5-pillar business model:

**Pipeline Stages**:
1. **PM Agent** - Gather candidate pipeline requirements and success metrics
2. **Database Architect** - Design candidate, job, placement, and cross-pollination tracking schema
3. **API Developer** - Build candidate CRUD, job matching algorithm, and placement tracking APIs
4. **Frontend Developer** - Create recruiter dashboard, candidate profiles, job matching UI
5. **Integration Specialist** - Connect cross-pillar workflows (Academy → Recruiting → Bench Sales)
6. **QA Engineer** - Test multi-tenancy, cross-pollination, and pod metrics
7. **Deployment Agent** - Deploy with zero downtime

## Staffing-Specific Features Included

### Core Functionality
- **Candidate Management**: Create, track, and update candidate profiles with skills, experience, visa status
- **Job Matching**: AI-powered algorithm to match candidates to job requirements
- **Placement Tracking**: Monitor 48-hour SLA for recruiting, 30-60 day SLA for bench sales
- **Pod Productivity**: Track placements per pod per 2-week sprint

### Cross-Pollination Workflows
1. **Training → Recruiting**: Auto-create candidate when student graduates
2. **Recruiting → Bench Sales**: Move placed candidates to bench when contract ends
3. **Client Interaction → Training**: Track when client needs reveal training opportunities
4. **Bench → Cross-Border**: Identify visa sponsorship opportunities

### Multi-Tenancy & Security
- **Row Level Security (RLS)**: Org A cannot see Org B candidates
- **Audit Trails**: Track all candidate data access (GDPR compliance)
- **Soft Deletes**: Never hard delete candidate data
- **PII Protection**: Encrypt sensitive data (SSN, visa details)

### Performance Targets
- Candidate search: < 200ms (with 10,000+ candidates)
- Job matching: < 500ms
- Resume parsing: < 3s
- Dashboard load: < 1.5s

**Estimated time**: 2-3 hours depending on complexity

Let me start by spawning the PM Agent to gather candidate pipeline requirements...
