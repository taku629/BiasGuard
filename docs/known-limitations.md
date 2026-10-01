# Known Limitations

- **EOD data (not real-time)**: Market data fetches rely on End-of-Day pricing. Real-time intraday prices are not supported.
- **US securities focus**: The app and its default data sources are currently optimized and tested primarily for US-listed securities.
- **Current-composition risk approximation**: Portfolio risk metrics are calculated based on the *current* asset allocation applied backward historically. It does not account for historical trades, rebalancing, or cash flows.
- **Behavioral indicators are not diagnosis**: The behavioral assessment provides educational heuristics based on common cognitive biases. It is not a clinical psychological diagnosis.
- **Assessment heuristics**: Results are based on simplified multiple-choice heuristics and may not capture the full nuance of an individual's decision-making process.
- **Marketstack dependency**: Core functionality relies on the Marketstack API. Outages or rate limits on their end directly impact the app's ability to analyze portfolios.
- **RevenueCat dependency**: Subscription management relies entirely on RevenueCat.
- **Offline limitations**: An active internet connection is required to fetch new data, calculate metrics, and process purchases. Offline mode only displays previously cached data.
