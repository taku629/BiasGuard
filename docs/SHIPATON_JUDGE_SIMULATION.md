# Shipathon Judge Simulation & Red Teaming

## Judge Personas & Questions

### Judge A: Product & Growth
1. What is the actual hook that brings users back after day 1?
2. Why wouldn't a user just use a free journaling app?
3. How do you scale the "bias detection" feature beyond generic advice?
4. What's the activation rate for manual entry users?
5. How does this integrate into their existing workflow?
6. If the market is a bull run, do users still care about risk?
7. What happens when a user disagrees with your bias assessment?
8. How did you validate that users will actually pay for this?
9. Are you targeting crypto gamblers or serious day traders?
10. What's your viral loop or referral mechanism?

### Judge B: Engineering & Implementation
1. How do you ensure user privacy when handling financial data?
2. What happens if the backend prompt for AI bias detection hallucinates?
3. How scalable is your current database schema?
4. Explain the offline capabilities and sync conflict resolution.
5. Why React Native / Expo instead of native or a web app?
6. What is the latency on generating the risk insights?
7. How are you handling rate limits on external APIs?
8. How secure is the local storage of user portfolios?
9. What happens if a user inputs 10,000 trades at once?
10. How will you maintain the AI models as trading narratives change?

### Judge C: RevenueCat / Monetization
1. Why is this a subscription and not a one-time purchase?
2. What features are strictly behind the paywall, and why?
3. What is the expected Customer Acquisition Cost (CAC)?
4. How do you handle churn if users feel they "cured" their biases?
5. Did you implement intro offers or free trials? Why/why not?
6. How does your pricing compare to professional trading tools?
7. Have you tested price elasticity?
8. What happens when a user's subscription lapses? Do they lose historical data?
9. Are there any in-app purchases or upsells planned?
10. How did you implement RevenueCat to track LTV?

## Best Answer Bank

* **20-Second Pitch**: "BiasGuard is the first AI-driven trading journal that identifies cognitive biases in your trading behavior before they cost you money. It analyzes your trades and gives you actionable risk insights."
* **60-Second Deep Dive**: "Most traders fail not because of strategy, but psychology. BiasGuard acts as a behavioral guardrail. Users log trades, our AI flags emotional patterns like 'Revenge Trading', and we provide actionable cooldowns. We use Expo for cross-platform speed, Supabase for backend, and RevenueCat for our $9.99/mo Pro tier targeting intermediate traders who know they need discipline."
* **Evidence to Cite**: "During early tests, users cited 'FOMO' and 'Revenge Trading' as their top capital killers, but lacked tools to track them in real-time."
* **What NOT to claim**: Do not claim we guarantee profitability or give financial advice.

## Judge Scoring Sheet (Evaluation Axes)
* **Problem/Solution Fit (1-10)**: Is it solving a real pain point?
* **Execution & Polish (1-10)**: UI/UX, performance, crash-free rate.
* **Technical Complexity (1-10)**: Sophistication of AI integration and data handling.
* **Monetization Viability (1-10)**: Clear path to revenue and logical paywalls.
* **Pitch & Storytelling (1-10)**: Clarity, conciseness, and impact of the demo.
