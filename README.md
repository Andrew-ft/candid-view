# CandidView

**AI-powered CV screening that puts fairness first.**

CandidView helps recruiters screen candidate CVs against job descriptions using semantic AI matching — not keyword matching. The core philosophy is "sort and explain — humans decide." Every candidate stays visible. Every match is explained. Recruiters always make the final call.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 |
| Database | SQLite via Prisma |
| Auth | NextAuth.js v5 (email/password) |
| AI | Anthropic Claude API (`claude-sonnet-4-5`) |
| File parsing | pdf-parse (PDF), mammoth (DOCX), native (TXT) |
| Package manager | pnpm |

---

## Setup

### 1. Clone and install

```bash
git clone <repo>
cd candidview
pnpm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | SQLite path, e.g. `file:./dev.db` |
| `NEXTAUTH_SECRET` | Random secret — generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | App URL, e.g. `http://localhost:3000` |
| `ANTHROPIC_API_KEY` | Your Anthropic API key from console.anthropic.com |

### 3. Database

```bash
pnpm db:push      # Create/migrate the SQLite database
pnpm db:studio    # Optional: open Prisma Studio to browse data
```

### 4. Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## How it works

### AI matching pipeline

All AI calls go through `lib/ai/index.ts` using Claude's structured tool use for reliable JSON output.

1. **`extractRequirements(jd)`** — Parses a job description into structured requirements: required skills, preferred skills, experience, education, domain knowledge, soft skills.

2. **`checkJdFairness(jd)`** — Scans the JD for potentially exclusionary language (unnecessary degree requirements, gendered language, culture-fit vagueness, inflated experience demands) and returns advisory flags with suggestions.

3. **`matchCvToJd(cv, requirements)`** — The core matching function. For each requirement, Claude evaluates whether the CV evidences it (strong / partial / none) with a one-sentence justification. Returns an overall tier (STRONG_FIT / WORTH_A_LOOK / LIKELY_NOT_A_FIT), a summary, and any notable context (transferable skills, career gaps with positive framing). The prompt explicitly biases toward inclusion on borderline cases.

4. **`candidateSelfCheck(cv, jd)`** — Used by the candidate guest flow. Same matching logic, but the response is framed as advice to the candidate: strengths, gaps, and concrete suggestions for what to highlight.

### Tiers

| Tier | Meaning | Colour |
|---|---|---|
| Strong fit | Clear evidence for most requirements | Sage green |
| Worth a look | Partial evidence; borderline; transferable skills | Amber |
| Likely not a fit | Significant gaps | Slate (never red) |

No candidate is ever hidden or auto-rejected. All three columns are equally accessible in the dashboard.

### Anonymised mode

A UI-only toggle in the results dashboard that replaces candidate names with "Candidate #01" etc. No data is changed — it's a display preference.

### Audit log

Every manual tier override is recorded with timestamp, previous tier, new tier, and optional note. Accessible at `/screenings/[id]/audit`.

---

## Test the AI module

```bash
pnpm test:ai
```

This runs `lib/ai/test.ts` with a sample JD and CV, calling all four AI functions and printing the structured output to the console.

---

## Project structure

```
app/
  (marketing)/        Landing page
  (candidate)/check   Candidate self-check (no auth)
  (recruiter)/        Protected recruiter app
    dashboard/        Screening list
    screenings/new    Multi-step creation wizard
    screenings/[id]   Results dashboard
    settings/         Account settings
  api/
    auth/             NextAuth + registration
    candidate-check/  Candidate self-check endpoint
    jd-fairness/      JD fairness analysis endpoint
    match/            Core CV↔JD matching endpoint
    parse-file/       File parsing endpoint
    screenings/       CRUD for screenings + candidates
lib/
  ai/                 Claude client, prompts, types, test script
  db/                 Prisma client
  parsing/            File parsers (PDF, DOCX, TXT)
prisma/
  schema.prisma       Data model
```
