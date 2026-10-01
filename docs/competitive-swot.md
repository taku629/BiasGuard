# Competitive SWOT Analysis

## Strengths
1. **Integrated View:** Only app that combines standard quantitative portfolio risk (Sharpe, Beta, Max Drawdown) with behavioral evidence tracking in the same dashboard.
2. **Transaction-Derived Signals:** Generates behavioral signals (like Disposition Effect and Loss Realization) from actual trading activity, not just surveys.
3. **Formula Explainability:** Extremely high transparency. Users can see exactly how their Volatility, Beta, and Behavioral indicators are calculated without "black box" ambiguity.
4. **Offline & Privacy Ready:** Pure client-side calculations combined with Firebase secure backends ensure that a user's transaction data remains their own, reducing data-harvesting concerns.
5. **Clear Niche:** Avoids the saturated "dividend tracker" or "broker sync app" market to firmly target self-aware investors looking to improve their decision-making.

## Weaknesses
1. **No Broker Sync:** Relying on manual transaction entry drastically increases friction for users with large, active portfolios.
2. **Limited Data Coverage:** Only supports US equities via Marketstack EOD data. Misses out on global stocks, options, crypto, and real-time intraday quotes.
3. **Approximated Risk:** Calculates risk based on *current composition* applied to historical data, rather than true historical personal performance tracing.
4. **No Advanced Financials:** Missing core features of modern trackers like dividend tracking, tax-loss harvesting, and multi-asset class breakdowns.
5. **No Coaching Layer:** Lacks the structured journaling or pre-trade checks found in pure behavioral apps like FinanSee.

## Opportunities
1. **Behavioral Analytics API:** Opening the behavioral engine for third-party brokerages or other portfolio trackers.
2. **Educational Monetization:** Users identifying their biases are highly likely to pay for targeted premium educational content or advanced calibration exercises.
3. **Feature Gate Expansion:** Expanding the Pro tier to include Behavioral History and Portfolio Comparison will strongly incentivize upgrades.
4. **Robo-Advisor Fatigue:** Investors are returning to self-directed trading, but many get burned. BiasGuard positions perfectly as the "safety net" for self-directed traders.
5. **Gamification:** Evolving the calibration assessments into daily or weekly engaging checks that increase retention without needing constant portfolio updates.

## Threats
1. **Major Trackers Adding Behavioral Features:** Apps like Delta, Sharesight, or Snowball could easily add heuristic checks to their already robust broker-synced platforms.
2. **Brokerage Native Tools:** Fidelity, Schwab, or Robinhood implementing "Trader Behavior Summaries" directly in their apps.
3. **AI Chatbots:** Users pasting their transaction history into LLMs (like ChatGPT) to get instant behavioral analysis without needing a dedicated app.
4. **Data Provider Costs:** Commercial mobile display licenses for stock data (e.g., Marketstack) could become prohibitively expensive as user bases grow.
5. **User Churn Post-Realization:** Once users learn their biases, they may fix them and churn, believing they no longer need the app's monitoring.
