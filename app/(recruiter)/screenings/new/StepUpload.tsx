"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, FileText, X, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";


interface Props {
  screeningId: string;
  onComplete: () => void;
}

interface UploadedFile {
  id: string;
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

export default function StepUpload({ screeningId, onComplete }: Props) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const processingRef = useRef(false);

  function addFiles(newFiles: FileList | File[]) {
    const supported = Array.from(newFiles).filter((f) =>
      [".pdf", ".docx", ".doc", ".txt"].some((ext) =>
        f.name.toLowerCase().endsWith(ext)
      )
    );
    setFiles((prev) => {
      const existingNames = new Set(prev.map((pf) => pf.file.name));
      const unique = supported.filter((f) => !existingNames.has(f.name));
      return [
        ...prev,
        ...unique.map((f) => ({
          id: `${f.name}-${Date.now()}-${Math.random()}`,
          file: f,
          status: "pending" as const,
        })),
      ];
    });
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }, []);

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  async function handleStartScreening() {
    if (files.length === 0 || processingRef.current) return;
    processingRef.current = true;
    setProcessing(true);

    const total = files.length;
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      setProgress(`Processing ${i + 1} of ${total}: ${f.file.name}`);
      setFiles((prev) =>
        prev.map((pf) => (pf.id === f.id ? { ...pf, status: "uploading" } : pf))
      );

      try {
        const formData = new FormData();
        formData.append("file", f.file);
        formData.append("screeningId", screeningId);

        const res = await fetch("/api/screenings/candidates", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");

        setFiles((prev) =>
          prev.map((pf) => (pf.id === f.id ? { ...pf, status: "done" } : pf))
        );
      } catch (err: unknown) {
        setFiles((prev) =>
          prev.map((pf) =>
            pf.id === f.id
              ? { ...pf, status: "error", error: err instanceof Error ? err.message : "Failed" }
              : pf
          )
        );
      }
    }

    setProgress("");
    setProcessing(false);
    processingRef.current = false;
    onComplete();
  }

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const doneCount = files.filter((f) => f.status === "done").length;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center text-center cursor-pointer transition-colors ${
          dragging
            ? "border-primary bg-primary/5"
            : "border-border bg-card hover:border-primary/40 hover:bg-primary/5"
        }`}
      >
        <Upload className={`w-8 h-8 mb-3 ${dragging ? "text-primary" : "text-muted-foreground"}`} />
        <p className="text-sm font-medium text-foreground mb-1">
          {dragging ? "Drop CVs here" : "Drop CVs here, or click to browse"}
        </p>
        <p className="text-xs text-muted-foreground">
          PDF, DOCX, DOC, or TXT — multiple files supported
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.doc,.txt"
          className="hidden"
          onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }}
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              {files.length} file{files.length !== 1 ? "s" : ""} added
            </span>
            {!processing && (
              <button
                onClick={() => setFiles([])}
                className="text-xs text-muted hover:text-foreground transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            {files.map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-2.5"
              >
                <FileText className="w-4 h-4 text-muted shrink-0" />
                <span className="flex-1 text-sm text-foreground truncate">{f.file.name}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {(f.file.size / 1024).toFixed(0)} KB
                </span>
                {f.status === "uploading" && (
                  <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin shrink-0" />
                )}
                {f.status === "done" && (
                  <CheckCircle className="w-4 h-4 text-strong-fit shrink-0" />
                )}
                {f.status === "error" && (
                  <span title={f.error}><AlertCircle className="w-4 h-4 text-accent shrink-0" /></span>
                )}
                {f.status === "pending" && !processing && (
                  <button
                    onClick={() => removeFile(f.id)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress */}
      {processing && progress && (
        <p className="text-sm text-muted text-center">{progress}</p>
      )}

      {/* CTA */}
      <button
        onClick={handleStartScreening}
        disabled={files.length === 0 || processing}
        className="self-start flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {processing ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Screening candidates...
          </>
        ) : (
          <>
            Start screening {files.length > 0 ? `(${files.length} CV${files.length !== 1 ? "s" : ""})` : ""}
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
      <p className="text-xs text-muted-foreground">
        Each CV is matched individually. This may take a moment for large batches.
      </p>
    </div>
  );
}
