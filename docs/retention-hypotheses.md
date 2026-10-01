# Retention Hypotheses

## Why Users Return

### Day 1
* **Hypothesis:** Users return on Day 1 because the initial setup/data entry takes time, and they want to see their first generated bias report. 
* **Current Features:** Manual entry, CSV upload, initial dashboard generation.

### Day 7
* **Hypothesis:** Users return on Day 7 to review their trading week in retrospect and see if their bias score shifted based on recent market volatility.
* **Current Features:** Weekly recap dashboard, basic bias tracking.

### Day 30
* **Hypothesis:** Users return on Day 30 to do a monthly portfolio review, correlating their monthly P&L with the behavioral insights provided.
* **Future Features:** Monthly deep-dive email reports, advanced charting against SPY.

### Day 90
* **Hypothesis:** Users return on Day 90 because the app has become a habitual part of their quarterly financial review process, and they rely on it to measure long-term behavioral improvement.
* **Future Features:** Quarterly progress tracking, historical behavioral trends over time.

---

## Top 10 Churn Reasons

| # | Churn Reason | Likelihood | Impact | Early Warning Sign | Mitigation Strategy |
|---|---|---|---|---|---|
| 1 | **Data Entry Fatigue:** Manual entry is too tedious. | High | High | No trades logged in 7 days | Introduce CSV/Broker sync; gamify manual entry. |
| 2 | **No Active Trading:** User stopped investing in the market. | Medium | Medium | Market volume down overall | N/A (Outside our control). |
| 3 | **Lack of Actionable Advice:** "Cool data, but what do I do?" | High | High | Viewing dashboard but not returning | Add educational tooltips and "Next Steps" coaching. |
| 4 | **Depression/Avoidance:** App shows they are terrible at trading; user avoids opening it. | Medium | High | High negative bias score followed by drop-off | Soften language; celebrate small wins. |
| 5 | **Price Sensitivity:** $6.99/mo feels too expensive for the value. | High | High | Canceling premium tier | Grandfathering, annual discounts, clear ROI messaging. |
| 6 | **Complexity:** UI is too hard to understand. | Medium | High | Bouncing in first 3 minutes | Better onboarding, simplified dashboard views. |
| 7 | **Tool Consolidation:** User moves to a broker that adds this feature. | Low | High | Account deletion | Maintain a better, standalone UI/UX than clunky brokers. |
| 8 | **Privacy Concerns:** Uncomfortable sharing financial data. | Low | High | Dropping off at data-entry screen | Clear privacy policy, local-first data options. |
| 9 | **Bugs/Performance:** App crashes during CSV upload. | Medium | Medium | Failed upload events in logs | Robust error handling, immediate bug fixes. |
| 10| **Feature Stagnation:** Got the initial insight, no reason to keep paying. | High | High | Logging in but session time < 10s | Introduce dynamic insights, peer benchmarking, new biases. |
