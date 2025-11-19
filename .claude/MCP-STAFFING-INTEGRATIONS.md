# InTime v3 - Staffing-Specific MCP Server Integrations

## Current MCP Servers

### Core Infrastructure (✅ Configured)
1. **GitHub** - Version control, PR management, CI/CD
2. **Filesystem** - File operations within project
3. **PostgreSQL** (Supabase) - Direct database access with RLS
4. **Puppeteer** - Browser automation for testing
5. **Slack** - Team notifications and alerts
6. **Sequential Thinking** - Enhanced reasoning for complex problems

---

## Recommended Staffing-Specific MCP Servers

### High Priority (Implement in Phase 1)

#### 1. Email Server (Resend)
**Purpose**: Transactional emails for candidate communication, client updates, interview scheduling

**Use Cases**:
- Send interview invitations to candidates
- Client placement notifications
- Bench consultant weekly check-ins
- Training academy graduation announcements
- Cross-pollination opportunity alerts to team

**MCP Configuration**:
```json
{
  "resend-email": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-resend"],
    "env": {
      "RESEND_API_KEY": "${RESEND_API_KEY}"
    }
  }
}
```

**Required Environment Variable**:
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
```

---

#### 2. Calendar Integration (Google Calendar or Microsoft Outlook)
**Purpose**: Interview scheduling, pod sprint planning, training session calendar

**Use Cases**:
- Auto-schedule candidate interviews based on recruiter availability
- Block time for client calls
- Training academy class schedules
- Pod sprint planning meetings (2-week cycles)

**MCP Configuration**:
```json
{
  "google-calendar": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-google-calendar"],
    "env": {
      "GOOGLE_CALENDAR_CREDENTIALS": "${GOOGLE_CALENDAR_CREDENTIALS}"
    }
  }
}
```

**Required Environment Variable**:
```bash
GOOGLE_CALENDAR_CREDENTIALS=path/to/credentials.json
```

---

#### 3. Document Processing Server (Custom)
**Purpose**: Resume parsing, job description analysis, contract generation

**Use Cases**:
- Parse candidate resumes and extract skills, experience, education
- Analyze job descriptions to extract requirements
- Generate placement contracts
- Extract candidate data from uploaded documents

**Custom MCP Server** (to be built):
```typescript
// .claude/mcp-servers/document-processor.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { parseResume } from '@/lib/ai/resume-parser';

const server = new Server({
  name: 'document-processor',
  version: '1.0.0',
}, {
  capabilities: {
    tools: {},
  },
});

// Tool: Parse Resume
server.setRequestHandler('tools/call', async (request) => {
  if (request.params.name === 'parse_resume') {
    const { fileUrl } = request.params.arguments;
    const parsedData = await parseResume(fileUrl);
    return {
      content: [{ type: 'text', text: JSON.stringify(parsedData) }],
    };
  }
});
```

**MCP Configuration**:
```json
{
  "document-processor": {
    "type": "stdio",
    "command": "node",
    "args": [".claude/mcp-servers/document-processor.js"]
  }
}
```

---

### Medium Priority (Implement in Phase 2)

#### 4. LinkedIn Integration (if API available)
**Purpose**: Candidate sourcing, profile enrichment, job posting

**Use Cases**:
- Post jobs to LinkedIn
- Enrich candidate profiles with LinkedIn data
- Source candidates from LinkedIn searches
- Track candidate engagement

**Note**: LinkedIn API has restrictions. May need to use LinkedIn Talent Solutions API (enterprise) or scraping (not recommended).

---

#### 5. Job Board Integration (Indeed, Dice, etc.)
**Purpose**: Multi-channel job posting, candidate sourcing

**Use Cases**:
- Post jobs to multiple job boards simultaneously
- Track applications from each source
- Source candidates from job boards
- Analyze job market trends

---

#### 6. SMS/WhatsApp Integration (Twilio)
**Purpose**: Quick candidate communication, interview reminders

**Use Cases**:
- Send interview reminders via SMS
- Quick updates to candidates on bench
- Emergency client notifications
- Pod team coordination

**MCP Configuration**:
```json
{
  "twilio-sms": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-twilio"],
    "env": {
      "TWILIO_ACCOUNT_SID": "${TWILIO_ACCOUNT_SID}",
      "TWILIO_AUTH_TOKEN": "${TWILIO_AUTH_TOKEN}",
      "TWILIO_PHONE_NUMBER": "${TWILIO_PHONE_NUMBER}"
    }
  }
}
```

---

### Low Priority (Nice to Have)

#### 7. Video Interview Platform (Zoom, Google Meet)
**Purpose**: Schedule and manage virtual interviews

**Use Cases**:
- Auto-create Zoom links for interviews
- Record interviews (with consent)
- Track interview attendance

---

#### 8. Background Check Integration (Checkr, GoodHire)
**Purpose**: Automate background checks for placed candidates

**Use Cases**:
- Initiate background checks post-offer
- Track background check status
- Alert recruiters when checks complete

---

#### 9. Payment/Invoicing (Stripe, QuickBooks)
**Purpose**: Client invoicing, consultant payments

**Use Cases**:
- Auto-generate invoices for placements
- Track payment status
- Consultant commission calculations

---

## InTime-Specific Custom MCP Servers

### Cross-Pollination Opportunity Detector
**Purpose**: AI-powered detection of cross-pillar opportunities from interactions

**Functionality**:
- Analyze interaction summaries (client calls, candidate interviews)
- Detect keywords and patterns (e.g., "need Guidewire training" → Training Academy opportunity)
- Score opportunities by confidence level
- Create actionable tasks for relevant pillar teams

**Custom Implementation Required**: Yes
**Complexity**: Medium-High (AI/NLP integration)
**Business Impact**: HIGH (core InTime differentiator)

---

### Pod Performance Analytics Server
**Purpose**: Real-time pod productivity metrics and insights

**Functionality**:
- Calculate placements per pod per sprint
- Track cross-pollination opportunities found by each pod
- Generate pod leaderboards
- Predict pod performance based on activity

**Custom Implementation Required**: Yes
**Complexity**: Medium
**Business Impact**: MEDIUM-HIGH

---

### Candidate Matching Engine
**Purpose**: AI-powered candidate-to-job matching

**Functionality**:
- Semantic matching of candidate skills to job requirements
- Consider visa status, location, availability
- Factor in client preferences and past placements
- Continuous learning from placement success/failure

**Custom Implementation Required**: Yes
**Complexity**: HIGH (ML/AI)
**Business Impact**: HIGH

---

## Implementation Roadmap

### Phase 1 (Month 1-2): Core Communication
1. ✅ Slack (already configured)
2. Email (Resend)
3. Calendar (Google Calendar)

### Phase 2 (Month 3-4): Document Processing & Intelligence
4. Document Processor (resume parsing)
5. Cross-Pollination Detector (custom MCP)

### Phase 3 (Month 5-6): Advanced Features
6. Candidate Matching Engine (custom MCP)
7. SMS/WhatsApp (Twilio)
8. LinkedIn Integration (if feasible)

### Phase 4 (Month 7+): Scaling & Optimization
9. Job Board Integration
10. Pod Analytics Server (custom MCP)
11. Background Check Integration
12. Payment/Invoicing

---

## Cost Estimates

### Monthly MCP Server Costs (at 1000 candidates, 50 active users)

| Server | Provider | Monthly Cost | Notes |
|--------|----------|--------------|-------|
| Email | Resend | $20-50 | ~10k emails/month |
| Calendar | Google Workspace | $12/user | 50 users = $600/month |
| SMS | Twilio | $100-200 | Emergency only |
| Document Processing | Claude API | $50-100 | Resume parsing |
| Background Checks | Checkr | Pay-per-check | ~$30/check |
| **TOTAL** | | **$800-1000/month** | Scales with usage |

### Custom MCP Server Development Costs

| Server | Development Time | Ongoing Maintenance |
|--------|-----------------|---------------------|
| Cross-Pollination Detector | 40-60 hours | 5 hours/month |
| Candidate Matching Engine | 80-120 hours | 10 hours/month |
| Pod Analytics Server | 20-30 hours | 3 hours/month |

---

## Security Considerations

### API Key Management
- Never commit API keys to git
- Use environment variables (`.env.local`)
- Rotate keys quarterly
- Use separate keys for dev/staging/production

### Data Privacy
- GDPR compliance: Candidate data must be deletable
- Audit all MCP server access to PII
- Encrypt sensitive data in transit and at rest
- Log all external API calls

### Rate Limiting
- Implement rate limiting on all MCP servers
- Monitor API usage and costs
- Alert when approaching quota limits

---

## Next Steps

1. **Immediate**: Set up Email (Resend) MCP server for transactional emails
2. **Week 1**: Configure Calendar integration for interview scheduling
3. **Week 2-3**: Build Document Processor MCP server for resume parsing
4. **Month 2**: Design and implement Cross-Pollination Detector (InTime's secret sauce)

---

**Last Updated**: 2025-11-17
**Owner**: InTime Engineering Team
**Priority**: HIGH (MCP servers are force multipliers for staffing operations)
