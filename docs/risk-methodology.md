# Risk Methodology

BiasGuard calculates risk metrics to provide a snapshot of the current portfolio's exposure. 

*Crucial Clarification: BiasGuard risk metrics are approximations based on applying historical asset returns to the user's **current portfolio composition**. They do NOT represent the historical personal performance of the user's account.*

## Metrics Calculated

1.  **Current Composition Risk:** We take the exact weights of the assets currently held and map historical daily returns over those assets to simulate how the *current* portfolio would have behaved over the past period.
2.  **Daily Returns:** Historical daily percentage changes of the underlying assets.
3.  **Volatility (Annualized):** The standard deviation of the simulated daily returns, annualized (typically multiplied by √252).
4.  **Sharpe Ratio:** A measure of risk-adjusted return. Calculated as (Annualized Return - Risk-Free Rate) / Annualized Volatility.
5.  **Maximum Drawdown (MDD):** The largest historical percentage drop from a peak to a trough for the current composition.
6.  **Beta:** A measure of volatility relative to the overall market.

## Benchmark & Data Handling
*   **SPY Benchmark:** The S&P 500 ETF (SPY) is used as the standard market benchmark for Beta calculations and comparative performance.
*   **Adjusted Close Handling:** We use adjusted closing prices to account for stock splits and dividends, ensuring accurate return calculations.
*   **Minimum Observations:** A minimum history is required to calculate statistically significant Volatility and Beta. If an asset is too new, it may be excluded or flagged.
*   **Missing Data Handling:** If historical data is missing for a specific date across the portfolio, that date is handled (via dropping or forward-filling) to maintain aligned time series arrays.
*   **Zero Variance Behavior:** Cash holdings or stablecoins will exhibit zero (or near-zero) variance. These are factored into the portfolio weights, naturally lowering the overall portfolio volatility and Beta.
