# BOMA Profile Readiness Score Calculation Logic

This document details exactly how BOMA calculates a user's profile **Readiness Score** (0–100) dynamically based on their onboarding choices.

---

## 1. Database-Driven Scoring Rules

The point values are stored in the `readiness_scoring_rules` table. When a user submits their profile, the scoring engine queries these active rules:

### A. Decision-Making Style (Step 3)
* **Consensus** (Option `consensus`): **85 points**
  * *Reasoning*: Pods that favor everyone weighing in have high consensus alignment but require patience.
* **Flexible** (Option `flexible`): **75 points**
  * *Reasoning*: Adaptive and practical group compromise.
* **Delegated** (Option `delegated`): **60 points**
  * *Reasoning*: High execution speed but lower overall consensus focus.

### B. Down Payment Readiness Tier (Step 5)
* **20%+** (Option `dp_20+`): **95 points**
  * *Reasoning*: High financial readiness for traditional lending.
* **10–20%** (Option `dp_10_20`): **85 points**
  * *Reasoning*: Solid down payment ready to proceed.
* **5–10%** (Option `dp_5_10`): **70 points**
  * *Reasoning*: Moderate readiness; may need private mortgage insurance.
* **0–5%** (Option `dp_0_5`): **50 points**
  * *Reasoning*: Early financial savings stage.

### C. Minimum Commitment Timeline (Step 7)
* **5+ years** (Option `timeline_5yr`): **90 points**
  * *Reasoning*: High community stability index.
* **2+ years** (Option `timeline_2yr`): **75 points**
  * *Reasoning*: Standard medium-term commitment.
* **Flexible** (Option `timeline_flexible`): **60 points**
  * *Reasoning*: High exit tolerance; lower stability rating.

---

## 2. Calculation Formula

The score is calculated as the **arithmetic mean (average)** of the points scored across all answered, scored categories:

$$\text{Readiness Score} = \text{round}\left( \frac{\sum \text{Matched Category Points}}{\text{Number of Matched Categories}} \right)$$

### Key Rules:
1. **Unscored Questions**: Optional or descriptive text steps (e.g. Preferred City, Relocation Radius, Age Group, Lifestyle checklists) are not assigned points in `readiness_scoring_rules` and are excluded from the average.
2. **Dynamic Adaptation**: If you add new single-choice questions with points in the admin panel, the engine automatically adds them to the average without requiring code changes.
3. **Baseline Fallback**: If no answers match any rules, a baseline score of **82** is assigned as a default.

---

## 3. Example Walkthrough

### Scenario:
A user goes through onboarding and selects:
* *Decision Style*: **Consensus** (Option `consensus`) $\rightarrow$ **85 points**
* *Down Payment*: **5–10%** (Option `dp_5_10`) $\rightarrow$ **70 points**
* *Commitment Timeline*: **5+ years** (Option `timeline_5yr`) $\rightarrow$ **90 points**

### Step-by-Step Calculation:
1. **Sum of points**:
   $$85 + 70 + 90 = 245$$
2. **Count of scored categories**:
   $$3$$
3. **Average calculation**:
   $$\frac{245}{3} = 81.666...$$
4. **Rounding**:
   $$\text{round}(81.666...) = \mathbf{82}$$

The user's final Readiness Score stored in `users.readiness_score` and `matching_pool_entries.readiness_score` will be **82**.

---

## 4. Javascript Engine Code Reference

This is the active logic extracted from `src/api/onboarding.js`:

```javascript
export async function calculateReadinessScore(userId) {
  // 1. Fetch user's responses
  const responses = await fetchSavedResponses(userId);
  if (responses.length === 0) return 0;

  // 2. Fetch all readiness rules
  const { data: rules, error: rulesError } = await supabase
    .from('readiness_scoring_rules')
    .select('*')
    .eq('is_active', true);

  if (rulesError) throw rulesError;

  // Map rules for quick lookup by option_id
  const rulesMap = {};
  rules.forEach(r => {
    rulesMap[r.option_id] = r.score_value;
  });

  // 3. Fetch all active options to map key/value to option_id
  const { data: options, error: optError } = await supabase
    .from('onboarding_question_options')
    .select('*')
    .eq('is_active', true);

  if (optError) throw optError;

  const optionKeyToIdMap = {};
  options.forEach(opt => {
    optionKeyToIdMap[opt.option_key] = opt.id;
    optionKeyToIdMap[opt.value] = opt.id;
  });

  // 4. Sum up points
  let totalScore = 0;
  let scoredCategoriesCount = 0;

  for (const resp of responses) {
    const val = resp.answer_json?.value;
    const optionId = optionKeyToIdMap[val];
    const scoreVal = rulesMap[optionId];

    if (scoreVal !== undefined) {
      totalScore += scoreVal;
      scoredCategoriesCount++;
    }
  }

  // 5. Return average, fallback to 82 if none matched
  if (scoredCategoriesCount === 0) {
    return 82; 
  }

  return Math.round(totalScore / scoredCategoriesCount);
}
```
