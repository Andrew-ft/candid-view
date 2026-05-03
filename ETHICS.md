# CandidView — Design Principles & Ethics

CandidView was built with a specific set of ethical commitments that shape every feature decision. This document explains those commitments and why they matter.

---

## 1. Human-in-the-loop — always

**The AI sorts and explains. Humans decide.**

CandidView never takes any automated action based on an AI recommendation. There is no auto-reject, no auto-advance, no automated email. Every action requires a recruiter to make a deliberate choice.

This is not just a limitation — it's the design. AI recommendations are fallible, especially in high-stakes decisions like hiring. The recruiter's domain knowledge, context, and judgement are irreplaceable.

*Implementation: The UI frames all AI output as "recommendations." Buttons say "Move to" not "Remove." The footer of every detail panel reads: "This is a recommendation. You decide."*

---

## 2. No auto-rejection — every candidate stays visible

**We never filter candidates out of view.**

In many ATS systems, candidates below a keyword threshold never reach human eyes. CandidView refuses this model. Every candidate uploaded to a screening appears in the dashboard, regardless of their AI tier.

The "Likely not a fit" tier is designed to be equally accessible to the recruiter — it uses a neutral slate colour (not red), the same card layout as other tiers, and the same "View details" affordance. The label itself is hedged: "likely," not "definitely."

*Why this matters: False negatives in hiring are costly and hard to detect. A candidate the AI underrates due to a non-traditional CV or career gap might be exactly who the role needs.*

---

## 3. Inclusion bias in AI prompts

**When uncertain, recommend — don't exclude.**

The prompts sent to Claude explicitly instruct the model to:
- Prefer "Worth a Look" over "Likely Not a Fit" on borderline cases
- Actively look for transferable skills, project work, volunteer work, and freelance experience as valid evidence
- Not penalise non-traditional CV formats or career gaps without context
- Look for non-obvious evidence of skills (e.g. open source contributions, side projects)

This is a deliberate correction for AI models that tend toward conservatism when matching patterns. We build the counter-bias into the prompt layer.

---

## 4. JD fairness check — before any CV is uploaded

**Bad requirements create bad pipelines.**

Before recruiters upload a single CV, CandidView analyses the job description for potentially exclusionary language. This includes:

- **Unnecessary degree requirements** — Many roles that list "Bachelor's required" function perfectly well with equivalent experience. Degree gating shrinks the pool and correlates with socioeconomic disadvantage.
- **Inflated experience demands** — "5+ years of React" is impossible for a technology that has existed for a certain period. These requirements signal culture, not skill.
- **Gendered language** — "Ninja," "rockstar," "aggressive growth" attract a narrower demographic. Research consistently shows this.
- **Vague culture-fit language** — "Cultural fit," "like-minded," and "team player" can function as proxies for affinity bias.

*The check is advisory and constructive — every flag includes a suggestion. Recruiters are never told their JD is "bad." They're given information to make a better decision.*

---

## 5. Semantic matching — not keyword matching

**Skills appear in many forms. Keyword matching misses them.**

A candidate who says "built REST APIs with Node" and "Express.js microservices" evidences "Node.js backend development" even if they never use that exact phrase. Keyword-based ATS systems penalise candidates who describe their experience naturally, and reward those who keyword-stuff.

Claude evaluates meaning — the semantic content of the CV — against the requirements. This catches transferable evidence that literal string matching would miss.

---

## 6. Anonymised mode

**Reducing first-impression bias is a feature, not a gimmick.**

Anonymised mode hides candidate names and file names in the dashboard. This is a UI-only toggle — no data is altered. It lets recruiters review the evidence before they see the name, reducing the risk of name-based bias influencing their initial assessment.

*Note: This is a partial measure. More thorough anonymisation (removing location, dates that imply age, institution names) is a direction for future development.*

---

## 7. Audit log

**Accountability for AI decisions — and your own.**

Every time a recruiter overrides an AI tier recommendation, the change is logged: who, when, from what tier, to what tier, and with what note. The audit log header reads: "Your overrides help us understand where the system gets it wrong."

This serves two purposes:
1. It creates accountability for the recruiter's own decisions.
2. Over time, override patterns reveal systematic AI errors — cases where the model consistently under- or over-rates certain profiles.

---

## 8. Language

**Words carry assumptions. We chose ours carefully.**

Throughout the product, we avoid:
- "Rejected," "filtered out," "eliminated," "failed" — hiring is not a binary pass/fail
- Red colour for the lowest tier — red signals stop/danger; our lowest tier is advisory, not a verdict
- Percentage match scores — false precision in a subjective, contextual assessment
- Passive voice about AI decisions — "The AI assessed" not "You have been assessed"

We use:
- "Likely not a fit" (hedged, provisional)
- "Worth a look" (inviting, not dismissive)  
- "You decide" (active, empowering)
- "We noticed…", "Worth considering…" (advisory, collaborative)

---

## Limitations and known gaps

CandidView is a prototype. These are real limitations:

- **No formal bias audit**: The AI prompts reduce certain forms of bias but have not been tested with demographic data against known-fair outcomes.
- **CV parsing quality varies**: PDFs with unusual layouts may parse poorly. Candidates with beautifully formatted CVs may be disadvantaged.
- **English only**: The current prompts assume English-language CVs and JDs.
- **Context limits**: Very long CVs or JDs may be truncated.
- **No feedback loop**: We do not yet capture recruiter feedback on AI accuracy to improve future recommendations.

These are not reasons to avoid the tool — they're reasons to keep humans in the loop.
