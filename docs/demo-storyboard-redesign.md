# Demo Storyboard Redesign & Stress Test

## Demo Failure Simulation & Non-Code Mitigations

* **Failure 1: Network Fails / AI API Timeout**
  * *Mitigation*: Have pre-loaded or mock responses cached in the demo build. If live, seamlessly pivot to showing the "Offline Mode / Journaling" feature.
* **Failure 2: Empty Portfolio (Cold Start)**
  * *Mitigation*: Ensure the demo device already has a seeded account with 5-10 realistic trades so charts and insights are populated instantly.
* **Failure 3: Text Too Small for Projection**
  * *Mitigation*: Pre-set device accessibility settings to larger fonts. Talk through the insights rather than expecting the audience to read paragraphs.
* **Failure 4: Hitting the 120s Limit**
  * *Mitigation*: Cut out the signup/login flow completely. Start directly on the Dashboard showing a high-risk alert.

## Demo Storyboard Stress Test (Evaluating shipaton-demo-final.md)

### First 5 Seconds (The Hook)
* **Current state**: Logging in and showing an empty state.
* **Critique**: Too slow. Judges lose interest.
* **Recommendation**: Start with a push notification: "🚨 Warning: High probability of Revenge Trading detected." Click it to open the app directly to the insight.

### First Value Realization
* **Current state**: User logs a trade, waits for AI analysis.
* **Critique**: Watching someone type a manual trade is boring.
* **Recommendation**: Show the manual entry very briefly, but focus on the "Aha!" moment—the colorful, digestible AI bias breakdown and risk meter.

### UI Transitions & Flow
* **Current state**: Navigating tab by tab.
* **Critique**: Feels like a standard tour, not a story.
* **Recommendation**: Drive the flow through a user narrative. "John just lost a trade. He opens the app, logs it, and BiasGuard stops him from making a second bad trade."

### Closing & Call to Action
* **Current state**: Showing the settings page and paywall.
* **Critique**: Weak ending.
* **Recommendation**: End on the monetization strategy. Show a locked "Advanced Pattern Recognition" feature, tap it, show the RevenueCat paywall seamlessly, and conclude with the business model.
