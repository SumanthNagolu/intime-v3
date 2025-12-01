# UC-ADMIN-007: Integration Management

**Version:** 1.0
**Last Updated:** 2025-11-30
**Role:** Admin
**Status:** Approved

---

## 1. Overview

This use case covers managing all external integrations in InTime OS, including configuration, monitoring, troubleshooting, and health checks for third-party services like email, payroll, background checks, job boards, and API integrations.

---

## 2. Integration Categories

### 2.1 Core Business Integrations

| Integration | Purpose | Provider | Status |
|------------|---------|----------|--------|
| **Email (SMTP)** | Transactional emails | SendGrid | Active |
| **Calendar** | Meeting scheduling | Google Calendar / Outlook | Active |
| **Document Storage** | Resume/file storage | AWS S3 | Active |
| **Background Checks** | Employment verification | Checkr | Active |
| **Job Boards** | Job posting | Indeed, LinkedIn, Dice | Active |

### 2.2 HR & Payroll Integrations

| Integration | Purpose | Provider | Status |
|------------|---------|----------|--------|
| **HRIS** | Employee data sync | BambooHR / Workday | Active |
| **Payroll** | Salary/benefits | ADP / Paychex | Active |
| **Benefits** | Insurance carriers | BCBS, Delta Dental, VSP | Active |
| **401k** | Retirement | Fidelity / Vanguard | Active |
| **E-Verify** | Work authorization | USCIS | Active |

### 2.3 Communication Integrations

| Integration | Purpose | Provider | Status |
|------------|---------|----------|--------|
| **SMS** | Text messaging | Twilio | Active |
| **Video** | Interviews | Zoom / Teams | Active |
| **Slack** | Team communication | Slack | Optional |
| **Phone** | VoIP calling | RingCentral | Optional |

### 2.4 Developer Integrations

| Integration | Purpose | Provider | Status |
|------------|---------|----------|--------|
| **API Access** | External apps | InTime API | Active |
| **Webhooks** | Event notifications | InTime Webhooks | Active |
| **Zapier** | No-code automation | Zapier | Active |
| **SSO** | Single Sign-On | Okta / Auth0 | Optional |

---

## 3. Integration Dashboard

```
┌────────────────────────────────────────────────────────────────┐
│ Integrations Dashboard                        [+ Add Integration│
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ HEALTH OVERVIEW                                                 │
│ ┌────────────┬────────────┬────────────┬────────────┐          │
│ │ Total      │ Active     │ Errors     │ Disabled   │          │
│ │ 18         │ 16 (89%)   │ 1 (6%)     │ 1 (6%)     │          │
│ └────────────┴────────────┴────────────┴────────────┘          │
│                                                                 │
│ CRITICAL ALERTS                                                 │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ 🔴 SMTP Email: Connection timeout (last 15 min)           │ │
│ │    Impact: Emails not sending                              │ │
│ │    [View Logs] [Reconnect] [Troubleshoot]                  │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ALL INTEGRATIONS                                                │
│ ┌──────────────┬─────────────┬──────────┬────────────────────┐│
│ │ Integration  │ Provider    │ Status   │ Last Sync          ││
│ ├──────────────┼─────────────┼──────────┼────────────────────┤│
│ │ 📧 Email     │ SendGrid    │🔴 Error  │ 2 min ago (failed) ││
│ │ 💼 HRIS      │ BambooHR    │🟢 Active │ 5 min ago          ││
│ │ 💰 Payroll   │ ADP         │🟢 Active │ 10 min ago         ││
│ │ 📋 BG Check  │ Checkr      │🟢 Active │ 1 hour ago         ││
│ │ 📱 SMS       │ Twilio      │🟢 Active │ 30 sec ago         ││
│ │ 📅 Calendar  │ Google      │🟢 Active │ 1 min ago          ││
│ │ 🔍 Job Boards│ Indeed      │🟢 Active │ 15 min ago         ││
│ │ ☁️ Storage   │ AWS S3      │🟢 Active │ Real-time          ││
│ │ ✅ E-Verify  │ USCIS       │🟢 Active │ 2 hours ago        ││
│ │ [View All 18 Integrations]                                  ││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                 │
│ [Health Check All] [View Logs] [Integration Settings]          │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 4. Configure Integration

### Example: SMTP Email Integration

```
┌────────────────────────────────────────────────────────────────┐
│ Email Integration (SMTP) - SendGrid                      [×]   │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ CONNECTION SETTINGS                                             │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Provider: [SendGrid                                     ▼] │ │
│ │                                                             │ │
│ │ SMTP Host:                                                  │ │
│ │ [smtp.sendgrid.net]                                         │ │
│ │                                                             │ │
│ │ SMTP Port:                                                  │ │
│ │ ● 587 (TLS) ○ 465 (SSL) ○ 25 (Unencrypted)                │ │
│ │                                                             │ │
│ │ Authentication:                                             │ │
│ │ Username (API Key):                                         │ │
│ │ [apikey]                                                    │ │
│ │                                                             │ │
│ │ Password (API Secret):                                      │ │
│ │ [************************************]  [Show] [Regenerate] │ │
│ │                                                             │ │
│ │ From Email:                                                 │ │
│ │ [noreply@intime.com]                                        │ │
│ │                                                             │ │
│ │ From Name:                                                  │ │
│ │ [InTime Staffing]                                           │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ RATE LIMITS                                                     │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Max emails/hour: [1000]                                     │ │
│ │ Max emails/day:  [25000]                                    │ │
│ │ Current usage:   247 today (1% of daily limit)             │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ WEBHOOK (Bounce/Complaint Handling)                             │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Webhook URL:                                                │ │
│ │ https://intime.com/api/webhooks/sendgrid                   │ │
│ │                                                             │ │
│ │ Events:                                                     │ │
│ │ ☑ Bounces     ☑ Spam Reports   ☑ Unsubscribes             │ │
│ │ ☑ Delivered   ☑ Opens          ☑ Clicks                    │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ TEST CONNECTION                                                 │
│ [Send Test Email to admin@intime.com] [Test Connection]        │
│                                                                 │
│ [Cancel]                    [Save] [Test & Save]               │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 5. Monitor Integration Health

```
┌────────────────────────────────────────────────────────────────┐
│ Integration Health - SMTP Email (SendGrid)                     │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ STATUS: 🔴 ERROR (Last 15 minutes)                             │
│                                                                 │
│ RECENT ERRORS (5)                                               │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ 10:42 AM - Connection timeout after 30 seconds             │ │
│ │ 10:41 AM - Connection timeout after 30 seconds             │ │
│ │ 10:40 AM - Connection timeout after 30 seconds             │ │
│ │ 10:38 AM - Connection timeout after 30 seconds             │ │
│ │ 10:35 AM - Connection timeout after 30 seconds             │ │
│ │                                                             │ │
│ │ Pattern: Repeated timeouts suggest network/firewall issue  │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ METRICS (Last 24 Hours)                                         │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Emails Sent:        1,247 (98% success rate)               │ │
│ │ Emails Failed:      23 (2% - above normal 0.5%)            │ │
│ │ Avg Response Time:  1.2 seconds (normal: 0.8s)             │ │
│ │ Uptime:             96.5% (target: 99.9%)                   │ │
│ │                                                             │ │
│ │ [📊 View Detailed Metrics]                                  │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ TROUBLESHOOTING                                                 │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Suggested Actions:                                          │ │
│ │ 1. [Check SendGrid Status Page] - Is service up?           │ │
│ │ 2. [Verify API Key] - Is key valid and not expired?        │ │
│ │ 3. [Test Network] - Can server reach smtp.sendgrid.net?    │ │
│ │ 4. [Check Firewall] - Is port 587 blocked?                 │ │
│ │ 5. [View Error Logs] - Full stack traces                   │ │
│ │ 6. [Switch to Backup] - Use AWS SES temporarily             │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ [Reconnect] [Disable Integration] [Contact Support]            │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 6. Webhooks Configuration

```
┌────────────────────────────────────────────────────────────────┐
│ Webhooks                                      [+ New Webhook]  │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ACTIVE WEBHOOKS                                                 │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Webhook: Job Created                                        │ │
│ │ URL: https://zapier.com/hooks/intime/job-created           │ │
│ │ Events: job.created                                         │ │
│ │ Status: 🟢 Active (last triggered 5 min ago)               │ │
│ │ Success Rate: 99.2% (last 30 days)                         │ │
│ │ [Edit] [Test] [View Logs] [Disable]                        │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Webhook: Candidate Submitted                               │ │
│ │ URL: https://example.com/api/candidate-submitted           │ │
│ │ Events: submission.created                                  │ │
│ │ Status: 🟢 Active (last triggered 12 min ago)              │ │
│ │ Success Rate: 100% (last 30 days)                          │ │
│ │ [Edit] [Test] [View Logs] [Disable]                        │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ AVAILABLE EVENTS                                                │
│ • job.created, job.updated, job.closed                         │
│ • candidate.created, candidate.updated                         │
│ • submission.created, submission.updated, submission.placed    │
│ • interview.scheduled, interview.completed                     │
│ • user.created, user.deactivated                               │
│                                                                 │
│ [View Webhook Documentation] [Test Webhook]                    │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 7. API Access Management

```
┌────────────────────────────────────────────────────────────────┐
│ API Access & Monitoring                                        │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ API USAGE (Last 24 Hours)                                       │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Total Requests:      47,234                                 │ │
│ │ Success (2xx):       46,891 (99.3%)                         │ │
│ │ Client Errors (4xx): 298 (0.6%)                             │ │
│ │ Server Errors (5xx): 45 (0.1%)                              │ │
│ │                                                             │ │
│ │ Top Endpoints:                                              │ │
│ │ • /api/jobs/list - 12,342 requests                         │ │
│ │ • /api/candidates/search - 8,901 requests                  │ │
│ │ • /api/submissions/create - 4,567 requests                 │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ RATE LIMITS                                                     │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Per Token:    1,000 req/hour, 100 req/min                  │ │
│ │ Per Org:      10,000 req/hour                              │ │
│ │ Current:      47 req/hour (well below limit)               │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ THROTTLED REQUESTS (0)                                          │
│ No rate limit violations in last 24 hours                      │
│                                                                 │
│ [View API Logs] [API Documentation] [Generate Report]          │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 8. Integration Logs

```
┌────────────────────────────────────────────────────────────────┐
│ Integration Logs - SMTP Email (SendGrid)                       │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ [Time Range: Last 24 hours ▼] [Level: All ▼] [🔍 Search]       │
│                                                                 │
│ 10:42:15 AM [ERROR] Connection timeout                         │
│ → smtp.sendgrid.net:587                                        │
│ → Error: ETIMEDOUT after 30000ms                               │
│ → Stack trace: [View Full]                                     │
│                                                                 │
│ 10:30:22 AM [INFO] Email sent successfully                     │
│ → To: candidate@example.com                                    │
│ → Subject: "Interview Invitation"                              │
│ → Message ID: <abc123@sendgrid.net>                            │
│ → Delivered in 1.2s                                             │
│                                                                 │
│ 10:15:08 AM [WARN] Slow response                               │
│ → Response time: 5.2s (normal: 0.8s)                           │
│ → Possible network congestion                                  │
│                                                                 │
│ 10:00:00 AM [INFO] Daily summary sent                          │
│ → 247 emails sent yesterday                                    │
│ → 99.2% success rate                                            │
│                                                                 │
│ [Export Logs] [Clear] [Auto-Refresh: ON]                       │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 9. Emergency Procedures

### Integration Failure Response

**If critical integration fails:**

1. **Immediate Actions:**
   - Check integration health dashboard
   - Review error logs
   - Test connection
   - Check third-party status page

2. **Fallback Options:**
   - **Email:** Switch to backup provider (AWS SES)
   - **Storage:** Use local storage temporarily
   - **Payroll:** Export CSV and upload manually
   - **Job Boards:** Post manually via web interface

3. **Communication:**
   - Alert affected users (email, Slack)
   - Post status update (internal)
   - Notify stakeholders (COO, CTO)

4. **Resolution:**
   - Work with vendor support
   - Implement fix
   - Test thoroughly
   - Re-enable integration
   - Post-mortem review

---

## 10. Best Practices

### Security

- **Store credentials in environment variables** (never hardcode)
- **Use least privilege** (API keys with minimum permissions)
- **Rotate keys regularly** (every 90 days)
- **Enable rate limiting** (prevent abuse)
- **Monitor for anomalies** (unusual traffic patterns)

### Reliability

- **Configure fallbacks** (backup providers)
- **Set up alerts** (errors, downtime, slow response)
- **Monitor health checks** (every 5 minutes)
- **Test integrations** (monthly verification)
- **Document recovery procedures** (runbooks)

### Performance

- **Cache API responses** (reduce external calls)
- **Batch operations** (bulk create/update)
- **Use webhooks** (push vs pull)
- **Implement retries** (exponential backoff)
- **Monitor latency** (alert if > 3 seconds)

---

## 11. Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-30 | Initial integration management documentation |

---

**End of UC-ADMIN-007**
