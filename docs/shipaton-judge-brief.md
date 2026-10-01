# BiasGuard - Shipaton Judge Brief

## What it is
BiasGuard is a React Native (Expo) application that serves as an analytics and behavioral layer for retail investors. 

## Problem
Retail investors monitor the market obsessively but fail to monitor their own decision-making patterns. They lack tools to understand their true portfolio risk and their cognitive biases (e.g., anchoring, overconfidence, disposition effect).

## Solution
BiasGuard analyzes transaction history and assessment inputs to provide a dual-lens view:
1. **Portfolio Risk Dashboard:** Objective risk metrics of the current composition.
2. **Behavioral Radar:** Analysis of 5 key psychological investing signals.

## Tech Challenge
Building a performant, cross-platform app that handles complex financial data, securely synchronizes with Firebase, calculates statistical risk metrics on the fly, and seamlessly integrates a Pro tier.

## RevenueCat Integration
BiasGuard uses RevenueCat to manage the "BiasGuard Pro" subscription. RevenueCat handles the complexity of cross-platform in-app purchases, entitlement verification, and state synchronization, gating advanced historical insights and benchmarks seamlessly.

## Behavioral Methodology
We measure 5 signals:
1. Disposition Effect
2. Loss Realization
3. Overconfidence Calibration
4. Information Selection
5. Reference-Price Sensitivity
Scores are derived from transaction history patterns combined with interactive user assessments, providing a holistic but objective view of investor behavior.

## Risk Methodology
Risk metrics (Volatility, Sharpe Ratio, MDD, Beta) are calculated by applying historical asset returns to the user's *current* portfolio composition, compared against the S&P 500 (SPY). This provides a snapshot of current exposure, not a track record of past performance.

## Privacy & Explainability
**Explainability:** No black-box scores. Every metric features an explainability overlay detailing exactly what triggered the score.
**Privacy:** BiasGuard is an analytics tool, not a clinical diagnostic tool. Assessments and behavioral signals are purely for self-reflection. Account deletion comprehensively removes all user data.

## Differentiator
While other tools simply show P&L, BiasGuard highlights the investor's blind spots. The core message: "See the risk in your portfolio and the patterns in your own decisions."

## Demo Flow
1. **Intro (0-10s):** The problem of retail investor blind spots.
2. **Value (10-25s):** See the risk in your portfolio and patterns in decisions.
3. **Dashboard (25-50s):** Showing the Portfolio Risk metrics.
4. **Behavioral Radar (50-80s):** Drilling into the 5 behavioral signals.
5. **Explainability/Assessments (80-100s):** Demonstrating transparent breakdowns and quizzes.
6. **Pro Tier (100-112s):** Showing the RevenueCat paywall.
7. **Closing (112-120s):** Final message and tagline.
