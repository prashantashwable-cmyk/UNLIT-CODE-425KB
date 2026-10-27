## 18. Pricing, quotation and negotiation logic

**Price ladder for base cost B (SOURCE, OCT/V3/BP).** Computed values for B = 100:

| Step | Multiplier | Price (B=100) | Markup on cost | Margin on price | Who may offer |
|---|---:|---:|---:|---:|---|
| First quote | 1.60 | 160 | 60.0% | 37.5% | Sales bot, automatic |
| Bot step 1 | 1.50 | 150 | 50.0% | 33.3% | Sales bot after counter-offer |
| Bot step 2 | 1.40 | 140 | 40.0% | 28.6% | Sales bot after counter-offer |
| Bot limit | 1.30 | 130 | 30.0% | 23.1% | Sales bot |
| Floor (locked) | 1.20 | 120 | 20.0% | 16.7% | Human Negotiator only |
| Below floor | < 1.20 | < 120 | < 20% | < 16.7% | Owner only, reason + second approval |

- "20% margin" in the sources is **markup on cost**; on selling price it is 16.7%. The first quote's 60% markup is 37.5% of price. Both are stored; the floor rule must state which is binding (DEC-008).
- **B must be fully loaded** (section 8, FULL_COST_BASE). Otherwise the 20% floor is eaten by costs nobody priced.
- Server validates every save, edit, counter, API call and PDF against the acting role's floor. Bot steps 160 → 150 → 140 → 130, each only after a counter-offer and each may request something back (faster token, referral, AMC sign-up). Bot cannot promise price, timeline, specification or terms outside configured values.
- Customers see price history and the final confirmed amount; never the floor or internal margin.
- Quote validity 7 days; versions immutable; rate card versioned with effective date, approver, supplier source, expiry.
- **Variation:** at QC clearance compare measured spec with quoted spec; if full-cost baseline differs by more than the threshold (5% proposed, DEC-009) issue a versioned variation quote at the same multipliers; no production on unsigned variation; the baseline and formula are stored.
- **Change orders** after production use the same variation mechanism with customer eSign and supplier acceptance (INFERENCE from MP§8.5).
- **Profitability report** per project: price − fully loaded cost, in both markup and margin terms.
