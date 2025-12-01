# UC-HR-011: Internal HR Dashboard & Analytics

**Version:** 1.0
**Last Updated:** 2025-11-30
**Role:** HR Manager
**Status:** Approved

---

## 1. Overview

This use case covers the comprehensive HR analytics dashboard for InTime OS, providing real-time visibility into workforce metrics, compliance status, recruiting performance, benefits utilization, and organizational health. HR Manager uses this dashboard for strategic decision-making and executive reporting.

---

## 2. Actors

- **Primary:** HR Manager
- **Secondary:** COO, CEO, CFO, Regional Directors
- **System:** HRIS, Analytics Engine, Reporting System

---

## 3. Main Dashboard

**Route:** `/hr/dashboard`

```
┌────────────────────────────────────────────────────────────────┐
│ HR Dashboard - InTime OS                         Dec 3, 2024   │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ WORKFORCE OVERVIEW                                              │
│ ┌──────────┬──────────┬──────────┬──────────┬──────────┐       │
│ │ Total    │ Active   │ New      │ Termed   │ Open Req │       │
│ │ 247      │ 245      │ +8 MTD   │ -3 MTD   │ 12       │       │
│ └──────────┴──────────┴──────────┴──────────┴──────────┘       │
│                                                                 │
│ HEADCOUNT BY ROLE                                               │
│ Technical Recruiter: 89 (36%)  ████████░░░░░░░░░░░░░░          │
│ Bench Sales:         67 (27%)  ██████░░░░░░░░░░░░░░░░          │
│ TA Specialist:       45 (18%)  ████░░░░░░░░░░░░░░░░░░          │
│ Management:          28 (11%)  ███░░░░░░░░░░░░░░░░░░░          │
│ Operations/HR:       18 (7%)   ██░░░░░░░░░░░░░░░░░░░░          │
│                                                                 │
│ RETENTION METRICS                                               │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ 90-Day Retention:     92% ✓ (target > 90%)                 │ │
│ │ Annual Turnover:      14% ✓ (target < 15%)                 │ │
│ │ Voluntary Turnover:   9%  ✓ (target < 10%)                 │ │
│ │ Regrettable Attrition: 6% ✓ (high performers leaving)      │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ CRITICAL ALERTS                                                 │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ 🟡 12 Immigration expirations < 90 days                    │ │
│ │ 🟡 5 FMLA recertifications overdue                         │ │
│ │ 🟢 Compliance Score: 92% (Good Standing)                   │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ [Recruiting] [Benefits] [Compliance] [Performance] [Reports]   │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 4. Recruiting Analytics

```
┌────────────────────────────────────────────────────────────────┐
│ Recruiting Performance - November 2024                         │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ HIRING FUNNEL                                                   │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Requisitions:    12 open                                   │ │
│ │ Applications:    247 received                              │ │
│ │ Screened:        89 (36% conversion)                       │ │
│ │ Interviewed:     34 (38% conversion)                       │ │
│ │ Offers:          10 (29% conversion)                       │ │
│ │ Accepted:        8 (80% acceptance rate) ✓                 │ │
│ │ Started:         8 (100% show rate) ✓                      │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ KEY METRICS                                                     │
│ Time to Fill:         38 days ✓ (target < 45)                  │
│ Time to Interview:    12 days ✓ (target < 15)                  │
│ Offer Acceptance:     80% ⚠️ (target > 85%)                    │
│ Cost per Hire:        $3,200 ✓ (target < $3,500)               │
│ Quality of Hire:      4.2/5 ✓ (90-day performance score)       │
│                                                                 │
│ SOURCING CHANNELS (Where candidates come from)                 │
│ Employee Referrals:   32% (highest quality, 4.5/5)             │
│ LinkedIn:             28%                                       │
│ Indeed:               18%                                       │
│ Agencies:             12%                                       │
│ Direct Apply:         10%                                       │
│                                                                 │
│ DIVERSITY HIRING                                                │
│ Female:               42% (target 40%)   ✓                      │
│ Underrepresented:     31% (target 30%)   ✓                      │
│                                                                 │
│ [View Candidate Pipeline] [Req Status] [Sourcing Report]       │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 5. Benefits & Compensation

```
┌────────────────────────────────────────────────────────────────┐
│ Benefits Utilization & Costs                                   │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ENROLLMENT STATUS                                               │
│ Medical:      198 (80%) - $356K/year employer cost             │
│ Dental:       187 (76%) - $52K/year                            │
│ Vision:       165 (67%) - $18K/year                            │
│ 401k:         156 (63%) - $142K/year (company match)           │
│ Life/Dis:     198 (80%) - $78K/year                            │
│                                                                 │
│ TOTAL BENEFITS COST                                             │
│ Per Employee:         $2,618/month ($31,416/year)              │
│ Total Annual:         $7.76M                                    │
│ As % of Payroll:      28% ✓ (target 25-30%)                    │
│                                                                 │
│ COMPENSATION ANALYSIS                                           │
│ Average Salary:       $78,450                                   │
│ Median Salary:        $72,000                                   │
│ Pay Equity (M/F):     0.98 ✓ (target 0.95-1.05)                │
│ Compa-Ratio:          1.02 ✓ (market competitive)              │
│                                                                 │
│ MERIT BUDGET (Next Cycle)                                       │
│ Budget Available:     3% of payroll ($540K)                     │
│ Allocated:            2.8% ($504K) - Room for $36K             │
│                                                                 │
│ [Benefits Details] [Open Enrollment] [Comp Analysis]           │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 6. Performance Management

```
┌────────────────────────────────────────────────────────────────┐
│ Performance & Development - 2024 Review Cycle                  │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ REVIEW COMPLETION (Annual Reviews - December)                  │
│ Completed:    187/247 (76%)  ████████████░░░░                  │
│ In Progress:   42/247 (17%)  ████░░░░░░░░░░░░                  │
│ Not Started:   18/247 (7%)   ██░░░░░░░░░░░░░░                  │
│ Deadline: Dec 15 (12 days remaining)                           │
│                                                                 │
│ PERFORMANCE DISTRIBUTION                                        │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Exceeds Expectations:   47 (25%) ████████░░░░░░░░░░░░      │ │
│ │ Meets Expectations:    118 (63%) ████████████████░░░░      │ │
│ │ Below Expectations:     22 (12%) ████░░░░░░░░░░░░░░        │ │
│ │ (60 reviews still pending)                                 │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ TARGET DISTRIBUTION: 20% / 70% / 10%                            │
│ Current: 25% / 63% / 12% ⚠️ (adjust before finalization)       │
│                                                                 │
│ EMPLOYEES ON PIP (Performance Improvement Plan)                │
│ Active PIPs:      8 employees                                   │
│ PIP Success Rate: 38% (past 12 months)                         │
│                                                                 │
│ PROMOTIONS (Next Cycle)                                         │
│ Recommended:      23 employees (9% promotion rate)              │
│ Budget Impact:    $287K annual increase                        │
│                                                                 │
│ [Review Status] [Calibration] [PIP Management] [Promotions]    │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 7. Compliance Dashboard

```
┌────────────────────────────────────────────────────────────────┐
│ Compliance Status - Real-Time Monitoring                       │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ OVERALL SCORE: 92% 🟢 Good Standing                            │
│                                                                 │
│ I-9/E-Verify:        98% ✓  (2 pending within window)          │
│ Benefits (ACA):      95% ✓  (3 minor items)                    │
│ Immigration:         88% 🟡 (12 expirations < 90 days)          │
│ FLSA (Wage/Hour):   100% ✓  (No violations)                    │
│ EEOC:               100% ✓  (No charges)                        │
│ OSHA:                95% ✓  (1 minor item)                     │
│ FMLA:                85% 🟡 (5 recertifications overdue)        │
│ Record Retention:    92% ✓  (2 gaps)                           │
│                                                                 │
│ UPCOMING DEADLINES                                              │
│ Dec 10: Carrier enrollment file                                │
│ Jan 31: W-2 distribution                                       │
│ Mar 31: ACA 1095-C distribution                                │
│                                                                 │
│ [Compliance Details] [Run Audit] [Immigration Tracker]         │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 8. Organizational Health

```
┌────────────────────────────────────────────────────────────────┐
│ Organizational Health Metrics                                  │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ EMPLOYEE ENGAGEMENT (Last Survey: Oct 2024)                    │
│ Overall Score:      78/100 ✓ (target > 75)                     │
│ Manager Effectiveness: 82/100 ✓                                │
│ Career Growth:      71/100 ⚠️ (improvement needed)             │
│ Work-Life Balance:  85/100 ✓                                   │
│ Compensation:       76/100 ✓                                   │
│ Response Rate:      87% ✓                                       │
│                                                                 │
│ TRAINING & DEVELOPMENT                                          │
│ Avg Training Hours:  42 hours/employee ✓ (target > 40)         │
│ Certification Rate:  34% of employees have professional certs  │
│ Tuition Reimb Used:  $87K of $250K budget (35%)                │
│                                                                 │
│ ATTENDANCE & LEAVE                                              │
│ Avg PTO Used:       12.3 days (of 15 available) ✓              │
│ Sick Days:          4.2 days/employee                          │
│ FMLA Cases:         23 active                                   │
│ Absenteeism Rate:   2.1% ✓ (target < 3%)                       │
│                                                                 │
│ [Engagement Survey] [Training Report] [Leave Management]       │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 9. Executive Summary Report

```
┌────────────────────────────────────────────────────────────────┐
│ Executive HR Summary - Monthly Report (November 2024)          │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ HEADCOUNT & MOVEMENT                                            │
│ • Starting Headcount: 242                                       │
│ • New Hires:          +8                                        │
│ • Terminations:       -3 (2 voluntary, 1 involuntary)          │
│ • Ending Headcount:   247                                       │
│ • Net Growth:         +5 (2% month-over-month)                  │
│                                                                 │
│ RECRUITING PERFORMANCE                                          │
│ • Open Requisitions:  12                                        │
│ • Offers Extended:    10                                        │
│ • Offers Accepted:    8 (80% acceptance)                        │
│ • Time to Fill:       38 days (Target < 45) ✓                  │
│ • Cost per Hire:      $3,200 ✓                                 │
│                                                                 │
│ RETENTION & TURNOVER                                            │
│ • 90-Day Retention:   92% ✓                                     │
│ • Annual Turnover:    14% ✓ (12-month rolling)                 │
│ • Voluntary Exits:    9% (manageable)                           │
│ • Top Reasons:        Better comp (40%), Career growth (30%)   │
│                                                                 │
│ BENEFITS & COMPENSATION                                         │
│ • Benefits Cost:      $2,618/emp/month                          │
│ • 401k Participation: 63% (Target 70%) ⚠️                      │
│ • Open Enrollment:    80% complete (deadline Nov 30)            │
│                                                                 │
│ COMPLIANCE                                                      │
│ • Overall Score:      92% ✓                                     │
│ • Critical Issues:    0                                         │
│ • Warnings:           17 (immigration expirations, FMLA)        │
│ • Audit Readiness:    Good                                      │
│                                                                 │
│ KEY INITIATIVES                                                 │
│ • Career development program launch (Q1 2025)                   │
│ • Manager training series (Q4 2024 - in progress)               │
│ • Compensation study (Q1 2025)                                  │
│                                                                 │
│ RISKS & MITIGATION                                              │
│ • 12 immigration expirations < 90 days → Renewal process active│
│ • Offer acceptance below target → Comp benchmarking planned    │
│ • Career growth scores low → Development program launching     │
│                                                                 │
│ [Download Full Report] [Email to Leadership] [Export to PDF]   │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 10. Key Metrics Reference

| Category | Metric | Formula | Target | Benchmark |
|----------|--------|---------|--------|-----------|
| **Recruiting** | Time to Fill | Days from req to start | < 45 days | Industry: 42 days |
| | Offer Acceptance | Accepted / Extended | > 85% | Industry: 85% |
| | Cost per Hire | Total recruiting cost / Hires | < $3,500 | Industry: $4,000 |
| | Quality of Hire | 90-day perf score | > 4.0/5 | - |
| **Retention** | 90-Day Retention | New hires > 90 days / Total | > 90% | Industry: 88% |
| | Annual Turnover | Terms / Avg headcount | < 15% | Industry: 17% |
| | Voluntary Turnover | Voluntary / Avg headcount | < 10% | Industry: 12% |
| **Benefits** | Benefits Cost % | Benefits cost / Payroll | 25-30% | Industry: 28% |
| | 401k Participation | Enrolled / Eligible | > 70% | Industry: 65% |
| **Compliance** | I-9 Completion | Complete I-9s / Total | 100% | Required: 100% |
| | Immigration Valid | Valid auth / Non-citizens | 100% | Required: 100% |
| **Performance** | High Performers | Exceeds rating / Total | 20% | Forced curve |
| | PIP Success | Improved / Total PIPs | 40-50% | - |

---

## 11. Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-30 | Initial HR dashboard and analytics documentation |

---

**End of UC-HR-011**
