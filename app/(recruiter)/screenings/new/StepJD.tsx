"use client";

import { useState, useRef } from "react";
import { Upload, FileText, ArrowRight } from "lucide-react";
import { isSupportedFileType } from "@/lib/parsing/utils";
import type { FairnessCheckResult } from "@/lib/ai/types";

interface Props {
  initialTitle: string;
  initialJD: string;
  onNext: (jobTitle: string, jobDescription: string, fairness: FairnessCheckResult) => void;
}

export default function StepJD({ initialTitle, initialJD, onNext }: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [jd, setJd] = useState(initialJD);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleNext() {
    if (!title.trim() || (!jd.trim() && !file)) {
      setError("Please provide a job title and description.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      let jdText = jd;
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const parseRes = await fetch("/api/parse-file", { method: "POST", body: formData });
        const parseData = await parseRes.json();
        if (!parseRes.ok) throw new Error(parseData.error);
        jdText = parseData.text;
      }

      const fairnessRes = await fetch("/api/jd-fairness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: jdText }),
      });
      const fairnessData = await fairnessRes.json();
      if (!fairnessRes.ok) throw new Error(fairnessData.error);
      onNext(title.trim(), jdText, fairnessData.result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div className="sm:col-span-2 flex flex-col gap-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Job title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Senior Software Engineer"
            className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Job description
          </label>
          <textarea
            value={jd}
            onChange={(e) => { setJd(e.target.value); setFile(null); }}
            placeholder="Paste the full job description here..."
            rows={14}
            disabled={!!file}
            className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y leading-relaxed"
          />
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-muted-foreground">or</span>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload file (PDF, DOCX, TXT)
            </button>
            {file && (
              <span className="flex items-center gap-1 text-xs text-muted">
                <FileText className="w-3.5 h-3.5" />
                {file.name}
                <button onClick={() => setFile(null)} className="ml-1 text-muted-foreground hover:text-foreground">×</button>
              </span>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f && isSupportedFileType(f.name)) { setFile(f); setJd(""); }
            }}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <button
          onClick={handleNext}
          disabled={loading}
          className="self-start flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Checking for fairness issues...
            </>
          ) : (
            <>
              Continue to fairness check
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      <aside className="hidden sm:block">
        <div className="bg-card border border-border rounded-xl p-5 text-sm leading-relaxed">
          <h3 className="font-semibold text-foreground mb-3">What happens next</h3>
          <ol className="flex flex-col gap-3 text-muted">
            <li className="flex gap-2">
              <span className="text-primary font-medium shrink-0">1.</span>
              We&apos;ll scan your JD for language that might exclude qualified candidates.
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-medium shrink-0">2.</span>
              You can review and choose to revise or keep the JD as-is.
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-medium shrink-0">3.</span>
              Upload candidate CVs and we&apos;ll match them to your requirements.
            </li>
          </ol>
          <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
            The fairness check is advisory — you always decide what to keep or change.
          </div>
        </div>
      </aside>
    </div>
  );
}
