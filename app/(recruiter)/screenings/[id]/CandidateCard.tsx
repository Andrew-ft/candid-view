"use client";

import type { Tier, RequirementMatch } from "@/lib/ai/types";

interface Candidate {
  id: string;
  fileName: string;
  summary: string;
  requirementMatches: RequirementMatch[];
}

interface Props {
  candidate: Candidate;
  displayName: string;
  tier: Tier;
  onSelect: () => void;
}

const TIER_COLORS: Record<Tier, string> = {
  STRONG_FIT: "bg-strong-fit",
  WORTH_A_LOOK: "bg-worth-a-look",
  LIKELY_NOT_A_FIT: "bg-likely-not",
};

const EVIDENCE_COLORS: Record<string, string> = {
  strong: "bg-strong-fit",
  partial: "bg-worth-a-look",
  none: "bg-likely-not/40",
};

function getInitials(name: string) {
  return name
    .split(/[\s-_]+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function getSkillTags(matches: RequirementMatch[]) {
  return matches
    .filter((m) => m.evidence !== "none" && m.type === "required")
    .slice(0, 4)
    .map((m) => m.requirement);
}

function MatchBar({ matches }: { matches: RequirementMatch[] }) {
  const total = matches.length;
  if (total === 0) return null;
  const segments = matches.map((m) => EVIDENCE_COLORS[m.evidence] ?? "bg-border");
  return (
    <div className="flex gap-0.5 h-1.5 rounded-full overflow-hidden">
      {segments.map((color, i) => (
        <div key={i} className={`flex-1 ${color}`} />
      ))}
    </div>
  );
}

export default function CandidateCard({ candidate, displayName, tier, onSelect }: Props) {
  const initials = getInitials(displayName);
  const tags = getSkillTags(candidate.requirementMatches);
  const dotColor = TIER_COLORS[tier];

  return (
    <button
      onClick={onSelect}
      className="w-full text-left bg-card border border-border rounded-xl p-4 hover:border-primary/30 hover:shadow-sm transition-all group"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${dotColor} shrink-0`} />
            <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
              {displayName}
            </p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          View →
        </span>
      </div>
      <p className="text-xs text-muted leading-relaxed mb-3 line-clamp-2">
        {candidate.summary}
      </p>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 bg-border/50 rounded-full text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <MatchBar matches={candidate.requirementMatches} />
    </button>
  );
}
