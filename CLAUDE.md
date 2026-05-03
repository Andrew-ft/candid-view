# CandidView — Claude Code Guide

## Project overview
AI-powered CV screening assistant. Philosophy: "sort and explain — humans decide."
Never auto-reject candidates, never use percentage scores, never use red for the lowest tier.

## Running the project

```bash
pnpm dev          # dev server at localhost:3000
pnpm build        # production build
pnpm test:ai      # test the AI module (requires ANTHROPIC_API_KEY)
pnpm db:push      # sync Prisma schema → SQLite
pnpm db:studio    # browse data in Prisma Studio
pnpm db:generate  # regenerate Prisma client after schema changes
```

## Environment
- pnpm binary: `C:\Users\Thant Pyae Sone Htoo\AppData\Roaming\npm\pnpm.ps1`
- Node linker: hoisted (set in `.npmrc`) — required on E:\ drive (no junction points without Windows Developer Mode)
- Next.js 15 (not 16) — Next.js 16 uses Turbopack by default which fails on E:\ without Developer Mode
- SQLite DB at `prisma/dev.db` (already created and migrated)

## AI module — `lib/ai/`
Four functions, all use Claude tool use for structured JSON output:
- `extractRequirements(jd)` — structured requirements from JD
- `checkJdFairness(jd)` — advisory fairness flags
- `matchCvToJd(cv, requirements)` — per-requirement evidence + tier
- `candidateSelfCheck(cv, jd)` — candidate-facing feedback

Model: `claude-sonnet-4-5`

## Design tokens (Tailwind CSS v4 — `app/globals.css`)
- Primary: `#0F766E` (deep teal)
- Accent/warning: `#F97066` (warm coral — fairness flags only)
- Strong fit: `#16A34A` (sage green)
- Worth a look: `#F59E0B` (amber)
- Likely not a fit: `#64748B` (slate — never red)
- Background: `#FAFAF9`

## Key rules
- Never use "rejected", "filtered out", "eliminated"
- No percentage match scores — use tiers and visual bars
- No red for lowest tier
- Every candidate stays visible (no hiding)
- Frame AI output as advisory: "We noticed…", "Worth considering…"

## Data model
User → Screening → Candidate → Override
All in SQLite via Prisma. Tier stored as string enum: STRONG_FIT | WORTH_A_LOOK | LIKELY_NOT_A_FIT
requirementMatches and jdFairnessFlags stored as JSON strings.

## Route groups
- `(marketing)` — public landing page
- `(candidate)` — guest flow, no auth required
- `(recruiter)` — protected, requires NextAuth session

## Auth
NextAuth v5 beta, JWT strategy, credentials provider (email/password).
`auth.ts` at project root. Middleware in `middleware.ts`.
