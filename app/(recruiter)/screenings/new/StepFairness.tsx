"use client";

import { useState } from "react";
import { AlertTriangle, ArrowRight, ChevronLeft } from "lucide-react";
import type { FairnessCheckResult, FairnessFlag } from "@/lib/ai/types";

interface Props {
  jobDescription: string;
  fairnessResult: FairnessCheckResult;
  onBack: () => void;
  onNext: () => Promise<void>;
}

function highlightFlags(text: string, flags: FairnessFlag[]) {
  if (flags.length === 0) return [<span key="text">{text}</span>];

  const parts: React.ReactNode[] = [];
  let lastIdx = 0;
  const sorted = [...flags].sort((a, b) => text.indexOf(a.phrase) - text.indexOf(b.phrase));

  for (const flag of sorted) {
    const idx = text.indexOf(flag.phrase, lastIdx);
    if (idx === -1) continue;
    if (idx > lastIdx) {
      parts.push(<span key={`t-${lastIdx}`}>{text.slice(lastIdx, idx)}</span>);
    }
    parts.push(
      <mark
        key={`flag-${idx}`}
        className="bg-accent/20 text-accent rounded-sm px-0.5 cursor-pointer"
        title={flag.concern}
      >
        {flag.phrase}
      </mark>
    );
    lastIdx = idx + flag.phrase.length;
  }
  if (lastIdx < text.length) {
    parts.push(<span key="end">{text.slice(lastIdx)}</span>);
  }
  return parts;
}

export default function StepFairness({ jobDescription, fairnessResult, onBack, onNext }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const flags = fairnessResult.flags;

  async function handleNext() {
    setLoading(true);
    setError("");
    try {
      await onNext();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {/* JD with highlights */}
      <div>
        <h2 className="text-sm font-medium text-foreground mb-3">
          Your job description
          {flags.length > 0 && (
            <span className="ml-2 text-xs font-normal text-accent">
              {flags.length} item{flags.length !== 1 ? "s" : ""} flagged
            </span>
          )}
        </h2>
        <div className="bg-card border border-border rounded-xl p-5 text-sm leading-relaxed text-muted whitespace-pre-wrap h-[480px] overflow-y-auto">
          {highlightFlags(jobDescription, flags)}
        </div>
      </div>

      {/* Fairness flags panel */}
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-foreground">
          {flags.length === 0 ? "No concerns found" : "Fairness considerations"}
        </h2>

        {flags.length === 0 ? (
          <div className="bg-strong-fit/10 border border-strong-fit/30 rounded-xl p-5">
            <p className="text-sm text-strong-fit font-medium mb-1">
              Looks good to us
            </p>
            <p className="text-sm text-muted">
              We didn&apos;t spot any obviously exclusionary language. That said,
              the check is advisory — your judgement always matters more.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1">
            {flags.map((flag, i) => (
              <div
                key={i}
                className="bg-card border border-accent/20 rounded-xl p-4"
              >
                <div className="flex items-start gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-foreground">
                    &ldquo;{flag.phrase}&rdquo;
                  </span>
                </div>
                <p className="text-xs text-muted leading-relaxed mb-2">
                  {flag.concern}
                </p>
                <div className="bg-primary/5 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground font-medium mb-0.5">
                    Suggestion
                  </p>
                  <p className="text-xs text-muted leading-relaxed">{flag.suggestion}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-4">
            These are advisory suggestions, not rules. You can revise your JD or continue as-is.
          </p>
          {error && (
            <p className="text-sm text-destructive mb-3">{error}</p>
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Revise JD
            </button>
            <button
              onClick={handleNext}
              disabled={loading}
              className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating screening...
                </>
              ) : (
                <>
                  Looks good — continue to CVs
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
