"use client";

import { useState } from "react";
import { Eye, EyeOff, Users, ClipboardList } from "lucide-react";
import Link from "next/link";
import CandidateCard from "./CandidateCard";
import CandidateDetail from "./CandidateDetail";
import type { RequirementMatch, Tier } from "@/lib/ai/types";

interface Candidate {
  id: string;
  fileName: string;
  tier: string;
  currentTier: string;
  summary: string;
  requirementMatches: RequirementMatch[];
  notableContext: string | null;
}

interface Props {
  screening: { id: string; jobTitle: string; candidateCount: number };
  candidates: Candidate[];
}

const TIERS: { key: Tier; label: string; colorClass: string; headerBg: string }[] = [
  { key: "STRONG_FIT", label: "Strong fit", colorClass: "text-strong-fit", headerBg: "bg-strong-fit/10 border-strong-fit/30" },
  { key: "WORTH_A_LOOK", label: "Worth a look", colorClass: "text-worth-a-look", headerBg: "bg-worth-a-look/10 border-worth-a-look/30" },
  { key: "LIKELY_NOT_A_FIT", label: "Likely not a fit", colorClass: "text-likely-not", headerBg: "bg-likely-not/10 border-likely-not/30" },
];

export default function ResultsDashboard({ screening, candidates }: Props) {
  const [anonymised, setAnonymised] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [localTiers, setLocalTiers] = useState<Record<string, Tier>>({});

  const selectedCandidate = candidates.find((c) => c.id === selectedId);

  function getDisplayTier(candidate: Candidate): Tier {
    return (localTiers[candidate.id] ?? candidate.currentTier) as Tier;
  }

  function handleOverride(candidateId: string, newTier: Tier, _note?: string) {
    setLocalTiers((prev) => ({ ...prev, [candidateId]: newTier }));
    // Persist to API
    fetch(`/api/screenings/candidates/${candidateId}/override`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newTier, note: _note }),
    }).catch(console.error);
  }

  const grouped = TIERS.reduce<Record<Tier, Candidate[]>>((acc, t) => {
    acc[t.key] = candidates.filter((c) => getDisplayTier(c) === t.key);
    return acc;
  }, { STRONG_FIT: [], WORTH_A_LOOK: [], LIKELY_NOT_A_FIT: [] });

  function candidateName(c: Candidate, idx: number) {
    if (anonymised) return `Candidate #${String(idx + 1).padStart(2, "0")}`;
    return c.fileName.replace(/\.[^.]+$/, "");
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Top bar */}
      <div className="border-b border-border bg-card px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link href="/dashboard" className="text-sm text-muted hover:text-foreground transition-colors shrink-0">
            <span className="hidden sm:inline">← Dashboard</span>
            <span className="sm:hidden">←</span>
          </Link>
          <span className="text-border hidden sm:inline">|</span>
          <h1 className="text-sm font-semibold text-foreground truncate">
            {screening.jobTitle}
          </h1>
          <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
            <Users className="w-3.5 h-3.5" />
            {screening.candidateCount}
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            onClick={() => setAnonymised((a) => !a)}
            title={anonymised ? "Anonymised" : "Anonymise names"}
            className={`flex items-center gap-1.5 text-xs px-2 sm:px-3 py-1.5 rounded-md border transition-colors ${
              anonymised
                ? "bg-primary text-white border-primary"
                : "text-muted border-border hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {anonymised ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{anonymised ? "Anonymised" : "Anonymise"}</span>
          </button>
          <Link
            href={`/screenings/${screening.id}/audit`}
            title="Audit log"
            className="flex items-center gap-1.5 text-xs px-2 sm:px-3 py-1.5 rounded-md border border-border text-muted hover:text-foreground hover:border-primary/40 transition-colors"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Audit log</span>
          </Link>
        </div>
      </div>

      {/* Three-column tier layout */}
      <div className="flex-1 p-4 sm:p-6 overflow-x-auto">
        <div className="grid grid-cols-3 gap-3 sm:gap-4 min-w-[600px] sm:min-w-0">
          {TIERS.map((tier) => (
            <div key={tier.key} className="flex flex-col gap-2 sm:gap-3">
              <div className={`rounded-lg border px-4 py-2.5 flex items-center justify-between ${tier.headerBg}`}>
                <span className={`text-sm font-semibold ${tier.colorClass}`}>
                  {tier.label}
                </span>
                <span className={`text-xs font-medium ${tier.colorClass}`}>
                  {grouped[tier.key].length}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {grouped[tier.key].length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">
                    No candidates in this tier
                  </p>
                ) : (
                  grouped[tier.key].map((c, idx) => (
                    <CandidateCard
                      key={c.id}
                      candidate={c}
                      displayName={candidateName(c, candidates.indexOf(c))}
                      tier={getDisplayTier(c)}
                      onSelect={() => setSelectedId(c.id)}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Candidate detail panel */}
      {selectedCandidate && (
        <CandidateDetail
          candidate={selectedCandidate}
          displayName={candidateName(selectedCandidate, candidates.indexOf(selectedCandidate))}
          currentTier={getDisplayTier(selectedCandidate)}
          onOverride={(newTier, note) => handleOverride(selectedCandidate.id, newTier, note)}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
