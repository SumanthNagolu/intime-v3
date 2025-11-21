# ACAD-018: XP Transactions UI

**Status:** ⚪ Not Started

**Story Points:** 3
**Sprint:** Sprint 3 (Week 9-10)
**Priority:** HIGH

---

## User Story

As a **Student**,
I want **Display XP history, awards, penalties**,
So that **I can get help 24/7 and stay motivated**.

---

## Acceptance Criteria

- [ ] XP transaction history page
- [ ] Filter by type (completions, badges, bonuses)
- [ ] Display reason and timestamp
- [ ] Visual indicator (positive/negative XP)
- [ ] Total XP prominently displayed
- [ ] XP progress bar to next level
- [ ] Export transaction history (CSV)

---

## Implementation

```typescript
export function XPTransactionList({ userId }: Props) {
  const { data: transactions } = trpc.progress.getMyXP.useQuery();

  return (
    <div>
      {transactions.map(tx => (
        <div key={tx.id} className={tx.xp_amount > 0 ? 'text-green' : 'text-red'}>
          <span className="font-bold">{tx.xp_amount > 0 ? '+' : ''}{tx.xp_amount} XP</span>
          <span>{tx.reason}</span>
          <span className="text-sm text-gray">{formatDate(tx.awarded_at)}</span>
        </div>
      ))}
    </div>
  );
}
```

---

**Dependencies:** ACAD-003
**Next:** ACAD-019 (Student Dashboard) - Sprint 4
