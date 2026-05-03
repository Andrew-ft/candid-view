"use client";

import { useState } from "react";
import { X, CheckCircle, AlertCircle, Minus, Lightbulb } from "lucide-react";
import type { Tier, RequirementMatch } from "@/lib/ai/types";

interface Candidate {
  id: string;
  fileName: string;
  summary: string;
  requirementMatches: RequirementMatch[];
  notableContext: string | null;
}

interface Props {
  candidate: Candidate;
  displayName: string;
  currentTier: Tier;
  onOverride: (newTier: Tier, note?: string) => void;
  onClose: () => void;
}

const TIERS: { key: Tier; label: string; color: string }[] = [
  { key: "STRONG_FIT", label: "Strong fit", color: "text-strong-fit" },
  { key: "WORTH_A_LOOK", label: "Worth a look", color: "text-worth-a-look" },
  { key: "LIKELY_NOT_A_FIT", label: "Likely not a fit", color: "text-likely-not" },
];

const EVIDENCE_ICONS: Record<string, React.ReactNode> = {
  strong: <CheckCircle className="w-3.5 h-3.5 text-strong-fit" />,
  partial: <AlertCircle className="w-3.5 h-3.5 text-worth-a-look" />,
  none: <Minus className="w-3.5 h-3.5 text-likely-not" />,
};

type DetailTab = "summary" | "notable" | "requirements";

export default function CandidateDetail({
  candidate,
  displayName,
  currentTier,
  onOverride,
  onClose,
}: Props) {
  const [overrideNote, setOverrideNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [pendingTier, setPendingTier] = useState<Tier | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>("summary");

  const currentTierConfig = TIERS.find((t) => t.key === currentTier)!;

  const tabs: { key: DetailTab; label: string }[] = [
    { key: "summary", label: "Summary" },
    ...(candidate.notableContext ? [{ key: "notable" as DetailTab, label: "Worth noting" }] : []),
    { key: "requirements", label: "Breakdown" },
  ];

  function handleTierSelect(tier: Tier) {
    if (tier === currentTier) return;
    setPendingTier(tier);
    setShowNoteInput(true);
  }

  function handleConfirmOverride() {
    if (!pendingTier) return;
    onOverride(pendingTier, overrideNote || undefined);
    setShowNoteInput(false);
    setOverrideNote("");
    setPendingTier(null);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-foreground/30 z-20"
        onClick={onClose}
      />

      {/* Panel — full screen on mobile, side panel on desktop */}
      <div className="fixed inset-0 sm:inset-auto sm:top-0 sm:right-0 sm:h-full sm:w-[440px] bg-card sm:border-l border-border z-30 flex flex-col shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
              <p className={`text-xs font-medium ${currentTierConfig.color}`}>
                {currentTierConfig.label}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-border/50 rounded-md transition-colors shrink-0"
          >
            <X className="w-4 h-4 text-muted" />
          </button>
        </div>

        {/* Override tier */}
        <div className="px-5 py-4 border-b border-border shrink-0">
          <p className="text-xs font-medium text-muted-foreground mb-2">Move to tier</p>
          <div className="flex gap-2">
            {TIERS.map((t) => (
              <button
                key={t.key}
                onClick={() => handleTierSelect(t.key)}
                className={`flex-1 text-xs py-2 px-1.5 rounded-md border transition-colors ${
                  t.key === currentTier
                    ? `border-current ${t.color} bg-current/10`
                    : "border-border text-muted hover:border-current hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {showNoteInput && pendingTier && (
            <div className="mt-3 flex flex-col gap-2">
              <input
                type="text"
                value={overrideNote}
                onChange={(e) => setOverrideNote(e.target.value)}
                placeholder="Optional note (e.g. 'Strong portfolio work')"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleConfirmOverride}
                  className="flex-1 text-xs bg-primary text-white py-2 rounded-md hover:bg-primary/90 transition-colors"
                >
                  Confirm move to {TIERS.find((t) => t.key === pendingTier)?.label}
                </button>
                <button
                  onClick={() => {
                    setShowNoteInput(false);
                    setPendingTier(null);
                    setOverrideNote("");
                  }}
                  className="text-xs text-muted hover:text-foreground px-3 py-2 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-border shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 text-xs py-3 font-medium transition-colors relative ${
                activeTab === tab.key
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab content — takes all remaining height */}
        <div className="flex-1 min-h-0 overflow-auto px-5 py-5">
          {activeTab === "summary" && (
            <p className="text-sm text-muted leading-relaxed">{candidate.summary}</p>
          )}

          {activeTab === "notable" && candidate.notableContext && (
            <div className="flex items-start gap-3">
              <Lightbulb className="w-4 h-4 text-worth-a-look shrink-0 mt-0.5" />
              <p className="text-sm text-muted leading-relaxed">{candidate.notableContext}</p>
            </div>
          )}

          {activeTab === "requirements" && (
            <div className="flex flex-col gap-2">
              {candidate.requirementMatches.map((m, i) => (
                <div key={i} className="bg-background border border-border rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <span className="shrink-0 mt-0.5">{EVIDENCE_ICONS[m.evidence]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-medium text-foreground">{m.requirement}</span>
                        <span className="text-xs text-muted-foreground px-1.5 py-0.5 bg-border/50 rounded-full capitalize">
                          {m.type}
                        </span>
                      </div>
                      <p className="text-xs text-muted leading-relaxed">{m.justification}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border shrink-0">
          <p className="text-xs text-muted-foreground text-center">
            This is a recommendation. You decide.
          </p>
        </div>
      </div>
    </>
  );
}
