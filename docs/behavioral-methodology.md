# Behavioral Methodology

BiasGuard tracks 5 key behavioral signals to help investors identify patterns in their decision-making. 

*Important: These signals provide analytics based on trading patterns and self-reported assessments. They are NOT a clinical or psychological diagnosis.*

## 1. Disposition Effect
*   **What it measures:** The tendency to sell winning assets too early and hold losing assets too long.
*   **Formula:** Compares the holding period and volume of realized gains vs. unrealized losses.
*   **Evidence Requirement:** Minimum number of closed trades and holding duration data.
*   **UI Severity:** High severity if the ratio of realized gains to realized losses is heavily skewed while holding significant unrealized losses.
*   **Limitations:** Tax-loss harvesting strategies might create false positives.

## 2. Loss Realization
*   **What it measures:** The aversion to accepting a loss, often leading to doubling down on bad trades.
*   **Formula:** Analyzes the frequency and size of average losses taken compared to average gains, and time to realize a loss.
*   **Evidence Requirement:** Transaction history showing completed round-trip trades.
*   **UI Severity:** Medium-High if losses are consistently larger than gains on average, indicating a refusal to cut losses.
*   **Limitations:** Can be noisy for long-term buy-and-hold investors with few sell transactions.

## 3. Overconfidence Calibration
*   **What it measures:** The gap between an investor's perceived knowledge/skill and actual outcomes, often leading to excessive trading.
*   **Formula:** Combines trading velocity (turnover rate) with results from the Overconfidence Assessment.
*   **Evidence Requirement:** High trading frequency coupled with assessment results indicating high certainty.
*   **UI Severity:** High if high trading velocity correlates with underperformance relative to a benchmark.
*   **Limitations:** High turnover might be a deliberate strategy (e.g., day trading) rather than irrational overconfidence.

## 4. Information Selection
*   **What it measures:** Confirmation bias and reliance on narrow information sources (echo chambers).
*   **Formula:** Derived primarily from the Information Selection Assessment, cross-referenced with portfolio diversity.
*   **Evidence Requirement:** Completed assessment regarding research habits.
*   **UI Severity:** Medium, flagged when assessment answers indicate reliance on single-sided information or social media hype.
*   **Limitations:** Heavily reliant on honest self-reporting in assessments.

## 5. Reference-Price Sensitivity
*   **What it measures:** Anchoring bias—making decisions based on a specific price point (like the 52-week high or purchase price) rather than fundamental value.
*   **Formula:** Measures the clustering of buy/sell events around historical high/low watermarks or exactly at the break-even price.
*   **Evidence Requirement:** Transaction timestamps mapped against historical price charts.
*   **UI Severity:** Medium, triggered when a high percentage of trades execute within a tight margin of past reference prices.
*   **Limitations:** Technical analysis strategies (support/resistance trading) intentionally use reference prices.
