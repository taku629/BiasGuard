# Strategic Competitive Analysis

## 1. Executive Summary
BiasGuard sits at the intersection of Portfolio Risk Trackers (like Morningstar) and Behavioral Finance tools (like FinanSee). Its primary value proposition is blending quantitative portfolio metrics (Sharpe, Beta) with transaction-derived behavioral heuristics (Disposition Effect). While it lacks the automated ease of major broker-synced trackers, its unique blend of transparent data and behavioral evidence provides a distinct, highly-targeted offering for self-aware retail investors.

## 2. Market Categories
*   **Direct Behavioral Finance:** Apps focused on investor psychology (FinanSee, Investor's Mirror).
*   **Portfolio Trackers:** Core portfolio monitoring with broker sync (Delta, Sharesight, Snowball Analytics).
*   **Risk Analytics:** Advanced quantitative analysis (Portfolio Visualizer, Nitrogen).
*   **Adjacent:** Trading journals, robo-advisors.

## 3. Direct Competitors
**FinanSee:**
Focuses heavily on behavioral coaching, decision journals, and pre-trade checks. 
*What BiasGuard does better:* Derives signals from actual transaction data rather than just journal entries; offers quantitative portfolio risk (Sharpe/Beta).
*What FinanSee does better:* Deep coaching, journaling, and active pre-trade intervention.

**Investor’s Mirror:**
Focuses on emotional check-ins and qualitative investor archetypes.
*BiasGuard's Edge:* Objective transaction-based evidence rather than qualitative feelings.

## 4. Indirect Competitors (Portfolio Trackers & Analytics)
**Delta / Sharesight / Snowball:**
Users will expect broker sync, real-time data, and dividend/tax tracking. BiasGuard will fail if positioned directly against these as a general "portfolio tracker."
**Portfolio Visualizer / Nitrogen:**
Deep factor analysis and stress testing. BiasGuard's current Volatility/Sharpe/Beta is a "lite" version of these, sufficient for basic dashboards but not for institutional quants.

## 5. Competitive Matrix
*See `docs/competitive-matrix.md` for the full data table.*

## 6. Closest Competitor
**FinanSee** is the closest conceptual competitor, but it focuses on qualitative journaling. BiasGuard leans more quantitative.

## 7. BiasGuard Unique Strengths
*   Transaction-derived behavioral heuristics (Disposition Effect tracking based on hard data).
*   Integration of portfolio risk (Sharpe) and behavioral risk in a single dashboard.
*   Total transparency/explainability of formulas.

## 8. BiasGuard Weaknesses
*   Manual transaction entry only.
*   EOD data only (US Equities).
*   Approximated risk (current composition applied backwards) rather than true historical attribution.

## 9. Feature Gaps
*   **P0 (Must-have before public release):** None. The MVP is cohesive.
*   **P1 (Strong v1.1 candidate):** Portfolio Comparison, Behavioral History.
*   **P2 (Later):** Risk Contribution, Benchmark Selection.
*   **Do Not Build:** Broker Sync (ruins privacy/simplicity moat), Tax Reporting, Dividend Tracking (competes with Sharesight where we will lose).

## 10. Pricing Position
**Current Market:**
*   Delta / Sharesight: ~$60 to $300+/year.
*   FinanSee: ~$10/month.

**BiasGuard Recommendation (Balanced):**
*   **Free:** 1 Portfolio, Basic Risk, 1 Assessment.
*   **Pro:** $7.99/mo or $69.99/yr. Fits neatly between casual tools and professional tax tools.

## 11. Paywall Position
BiasGuard's paywall (Multiple Portfolios, Full 5-Signal Dashboard, Detailed Explainability) perfectly matches industry norms. Analytics depth and multi-portfolio support are the standard levers for monetization.

## 12. Recommended Category
**Primary:** Investment Decision Analytics
**Secondary:** Behavioral Finance Tracker

## 13. Recommended One-liner
*"BiasGuard helps investors see both portfolio risk and the patterns in their own decisions."*

## 14. Shipaton Narrative
*"Retail investors constantly monitor the market, but rarely monitor themselves. Traditional trackers show you what your portfolio did, but not why you made the decisions that led to it. BiasGuard analyzes your actual transaction history to reveal quantitative portfolio risk alongside behavioral blind spots—like holding losers too long. It’s radical transparency for the self-directed investor."*

## 15. v1.1 Priorities
1. Behavioral History tracking over time.
2. Portfolio Comparison (A/B testing strategies).
3. VaR / CVaR additions to the Risk Dashboard.

## 16. Features to Avoid
*   Broker Sync (Avoid Plaid/Yodlee costs and security overhead).
*   Trading Journals (Too much friction, stick to data-derived signals).
*   AI stock recommendations (Violates the core ethos).

## 17. Marketing Claims to Avoid
*   *"The ONLY behavioral app"* (False).
*   *"Guaranteed to improve returns"* (Compliance risk).
*   *"Clinical psychological diagnosis"* (Legal/Medical risk).

## 18. P0/P1/P2 recommendations
*Refer to Section 9.*

---

**DOES BIASGUARD HAVE A DEFENSIBLE DIFFERENTIATOR?**
**PARTIALLY.**
BiasGuard uniquely combines quantitative risk metrics with transaction-derived behavioral signals in a highly transparent UI. However, a major player like Delta or Snowball Analytics could replicate the heuristic behavioral algorithms. BiasGuard's true moat must be built on its niche focus, educational explainability, and privacy-first manual approach.

**DO WE NEED TO BREAK FEATURE FREEZE BEFORE SHIPATON?**
**NO.**
The v1.0 feature set is extremely cohesive and tells a complete story for the Shipaton context. Adding features like broker sync or dividend tracking now would only dilute the behavioral-risk narrative and introduce immense technical risk. The MVP is ready.
