"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StepJD from "./StepJD";
import StepFairness from "./StepFairness";
import StepUpload from "./StepUpload";
import type { FairnessCheckResult } from "@/lib/ai/types";

type Step = 1 | 2 | 3;

interface ScreeningDraft {
  jobTitle: string;
  jobDescription: string;
  fairnessResult: FairnessCheckResult | null;
  fairnessAccepted: boolean;
}

export default function NewScreeningPage() {
  const [step, setStep] = useState<Step>(1);
  const [draft, setDraft] = useState<ScreeningDraft>({
    jobTitle: "",
    jobDescription: "",
    fairnessResult: null,
    fairnessAccepted: false,
  });
  const [screeningId, setScreeningId] = useState<string | null>(null);
  const router = useRouter();

  async function handleJDSubmit(jobTitle: string, jobDescription: string, fairnessResult: FairnessCheckResult) {
    setDraft((d) => ({ ...d, jobTitle, jobDescription, fairnessResult }));
    setStep(2);
  }

  async function handleFairnessAccept() {
    // Create the screening in DB
    const res = await fetch("/api/screenings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobTitle: draft.jobTitle,
        jobDescription: draft.jobDescription,
        jdFairnessFlags: draft.fairnessResult?.flags ?? [],
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setScreeningId(data.id);
    setStep(3);
  }

  async function handleUploadComplete() {
    router.push(`/screenings/${screeningId}`);
  }

  const steps = [
    { n: 1, label: "Job description" },
    { n: 2, label: "Fairness check" },
    { n: 3, label: "Upload CVs" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <a href="/dashboard" className="text-sm text-muted hover:text-foreground transition-colors">
          ← Dashboard
        </a>
        <h1 className="text-2xl font-semibold text-foreground mt-4 mb-6">
          New screening
        </h1>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {steps.map(({ n, label }, i) => (
            <div key={n} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  step === n
                    ? "bg-primary text-white"
                    : step > n
                    ? "bg-primary/10 text-primary"
                    : "bg-border/50 text-muted-foreground"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                    step === n ? "bg-white/20" : ""
                  }`}
                >
                  {step > n ? "✓" : n}
                </span>
                {label}
              </div>
              {i < steps.length - 1 && (
                <div className="w-6 h-px bg-border" />
              )}
            </div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <StepJD
          initialTitle={draft.jobTitle}
          initialJD={draft.jobDescription}
          onNext={handleJDSubmit}
        />
      )}
      {step === 2 && draft.fairnessResult && (
        <StepFairness
          jobDescription={draft.jobDescription}
          fairnessResult={draft.fairnessResult}
          onBack={() => setStep(1)}
          onNext={handleFairnessAccept}
        />
      )}
      {step === 3 && screeningId && (
        <StepUpload
          screeningId={screeningId}
          onComplete={handleUploadComplete}
        />
      )}
    </div>
  );
}
