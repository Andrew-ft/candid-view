"use client";

import { useState, useRef } from "react";
import { Upload, FileText, ArrowRight, CheckCircle, AlertCircle, Minus } from "lucide-react";
import type { SelfCheckResult } from "@/lib/ai/types";

type EvidenceLevel = "strong" | "partial" | "none";

const TIER_CONFIG = {
  STRONG_FIT: {
    label: "Strong match",
    color: "text-strong-fit",
    bg: "bg-strong-fit/10",
    border: "border-strong-fit/30",
    emoji: "✓",
  },
  WORTH_A_LOOK: {
    label: "Worth exploring",
    color: "text-worth-a-look",
    bg: "bg-worth-a-look/10",
    border: "border-worth-a-look/30",
    emoji: "~",
  },
  LIKELY_NOT_A_FIT: {
    label: "Some gaps to address",
    color: "text-likely-not",
    bg: "bg-likely-not/10",
    border: "border-likely-not/30",
    emoji: "–",
  },
};

const EVIDENCE_CONFIG: Record<EvidenceLevel, { icon: React.ReactNode; label: string; color: string }> = {
  strong: {
    icon: <CheckCircle className="w-4 h-4" />,
    label: "Strong match",
    color: "text-strong-fit",
  },
  partial: {
    icon: <AlertCircle className="w-4 h-4" />,
    label: "Partial match",
    color: "text-worth-a-look",
  },
  none: {
    icon: <Minus className="w-4 h-4" />,
    label: "Not evidenced",
    color: "text-likely-not",
  },
};

export default function CandidateCheckPage() {
  const [jd, setJd] = useState("");
  const [cv, setCv] = useState("");
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [result, setResult] = useState<SelfCheckResult | null>(null);
  const [error, setError] = useState("");
  const jdFileRef = useRef<HTMLInputElement>(null);
  const cvFileRef = useRef<HTMLInputElement>(null);

  async function handleCheck() {
    if ((!jd.trim() && !jdFile) || (!cv.trim() && !cvFile)) {
      setError("Please provide both a job description and your CV.");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);
    setLoadingMsg("Analysing your CV...");

    try {
      const formData = new FormData();
      if (jdFile) {
        formData.append("jdFile", jdFile);
      } else {
        formData.append("jd", jd);
      }
      if (cvFile) {
        formData.append("cvFile", cvFile);
      } else {
        formData.append("cv", cv);
      }

      setLoadingMsg("Matching your experience to the role...");

      const res = await fetch("/api/candidate-check", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setResult(data.result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMsg("");
    }
  }

  function handleReset() {
    setResult(null);
    setJd("");
    setCv("");
    setJdFile(null);
    setCvFile(null);
    setError("");
  }

  if (result) {
    const tier = TIER_CONFIG[result.tier];
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <button
          onClick={handleReset}
          className="text-sm text-muted hover:text-foreground mb-8 flex items-center gap-1 transition-colors"
        >
          ← Check another role
        </button>

        {/* Overall result */}
        <div className={`rounded-xl border ${tier.border} ${tier.bg} p-6 mb-8`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full ${tier.bg} border ${tier.border} flex items-center justify-center shrink-0`}>
              <span className={`text-xl font-bold ${tier.color}`}>{tier.emoji}</span>
            </div>
            <div>
              <p className={`text-sm font-medium ${tier.color} mb-1`}>{tier.label}</p>
              <p className="text-foreground leading-relaxed">{result.summary}</p>
            </div>
          </div>
        </div>

        {/* Strengths */}
        {result.strengths.length > 0 && (
          <section className="mb-8">
            <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-strong-fit inline-block" />
              What works in your favour
            </h2>
            <ul className="flex flex-col gap-2">
              {result.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted">
                  <CheckCircle className="w-4 h-4 text-strong-fit shrink-0 mt-0.5" />
                  {s}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Gaps */}
        {result.gaps.length > 0 && (
          <section className="mb-8">
            <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-worth-a-look inline-block" />
              Areas to address in your application
            </h2>
            <ul className="flex flex-col gap-2">
              {result.gaps.map((g, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted">
                  <AlertCircle className="w-4 h-4 text-worth-a-look shrink-0 mt-0.5" />
                  {g}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Suggestions */}
        {result.suggestions.length > 0 && (
          <section className="mb-8">
            <h2 className="text-base font-semibold text-foreground mb-4">
              Suggestions for your application
            </h2>
            <div className="flex flex-col gap-3">
              {result.suggestions.map((s, i) => (
                <div key={i} className="bg-card border border-border rounded-lg p-4">
                  <p className="text-sm font-medium text-foreground mb-1">{s.area}</p>
                  <p className="text-sm text-muted leading-relaxed">{s.advice}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Requirement breakdown */}
        <section className="mb-10">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Requirement-by-requirement breakdown
          </h2>
          <div className="flex flex-col gap-2">
            {result.requirementMatches.map((m, i) => {
              const ev = EVIDENCE_CONFIG[m.evidence as EvidenceLevel];
              return (
                <div key={i} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`flex items-center gap-1 text-xs font-medium ${ev.color}`}>
                          {ev.icon}
                          {ev.label}
                        </span>
                        <span className="text-xs text-muted-foreground px-2 py-0.5 bg-border/50 rounded-full capitalize">
                          {m.type}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground">{m.requirement}</p>
                      <p className="text-xs text-muted mt-1 leading-relaxed">{m.justification}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <p className="text-xs text-muted-foreground text-center border-t border-border pt-6">
          This is a recommendation, not a verdict. Recruiters make the final call.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-10">
        <a href="/" className="text-sm text-muted hover:text-foreground mb-6 inline-block transition-colors">
          ← CandidView
        </a>
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-2">
          Check your match
        </h1>
        <p className="text-muted">
          Paste a job description and your CV to see how well you match — with
          honest, actionable feedback. No account needed.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Job description */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Job description
          </label>
          <textarea
            value={jd}
            onChange={(e) => {
              setJd(e.target.value);
              setJdFile(null);
            }}
            placeholder="Paste the job description here..."
            rows={8}
            className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y leading-relaxed"
            disabled={!!jdFile}
          />
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-muted-foreground">or</span>
            <button
              type="button"
              onClick={() => jdFileRef.current?.click()}
              className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload file (PDF, DOCX, TXT)
            </button>
            {jdFile && (
              <span className="flex items-center gap-1 text-xs text-muted">
                <FileText className="w-3.5 h-3.5" />
                {jdFile.name}
                <button
                  onClick={() => setJdFile(null)}
                  className="ml-1 text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </span>
            )}
          </div>
          <input
            ref={jdFileRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) { setJdFile(f); setJd(""); }
            }}
          />
        </div>

        {/* CV */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Your CV
          </label>
          <textarea
            value={cv}
            onChange={(e) => {
              setCv(e.target.value);
              setCvFile(null);
            }}
            placeholder="Paste your CV here..."
            rows={10}
            className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y leading-relaxed"
            disabled={!!cvFile}
          />
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-muted-foreground">or</span>
            <button
              type="button"
              onClick={() => cvFileRef.current?.click()}
              className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload file (PDF, DOCX, TXT)
            </button>
            {cvFile && (
              <span className="flex items-center gap-1 text-xs text-muted">
                <FileText className="w-3.5 h-3.5" />
                {cvFile.name}
                <button
                  onClick={() => setCvFile(null)}
                  className="ml-1 text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </span>
            )}
          </div>
          <input
            ref={cvFileRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) { setCvFile(f); setCv(""); }
            }}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <button
          onClick={handleCheck}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-md font-medium hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {loadingMsg || "Checking..."}
            </>
          ) : (
            <>
              Check my match
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-xs text-muted-foreground text-center">
          Your data is only used for this check and is not stored.
          This is a recommendation — recruiters make the final call.
        </p>
      </div>
    </div>
  );
}
