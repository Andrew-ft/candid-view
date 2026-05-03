import { auth } from "@/auth";
import { prisma } from "@/lib/db/client";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const TIER_LABELS: Record<string, string> = {
  STRONG_FIT: "Strong fit",
  WORTH_A_LOOK: "Worth a look",
  LIKELY_NOT_A_FIT: "Likely not a fit",
};

const TIER_COLORS: Record<string, string> = {
  STRONG_FIT: "text-strong-fit bg-strong-fit/10",
  WORTH_A_LOOK: "text-worth-a-look bg-worth-a-look/10",
  LIKELY_NOT_A_FIT: "text-likely-not bg-likely-not/10",
};

export default async function AuditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const screening = await prisma.screening.findFirst({
    where: { id, userId: session.user.id },
    include: {
      candidates: {
        include: {
          overrides: { orderBy: { createdAt: "asc" } },
        },
      },
    },
  });

  if (!screening) notFound();

  const allOverrides = screening.candidates.flatMap((c) =>
    c.overrides.map((o) => ({ ...o, candidateFileName: c.fileName }))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href={`/screenings/${id}`}
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              ← {screening.jobTitle}
            </Link>
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Audit log</h1>
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-xl px-5 py-4 mb-6">
        <p className="text-sm text-muted">
          Your overrides help understand where the AI recommendation differs from your judgement.
          This log is for your own records and is never shared.
        </p>
      </div>

      {allOverrides.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-12 text-center">
          <p className="text-sm text-muted-foreground">No overrides yet.</p>
          <p className="text-xs text-muted-foreground mt-1">
            When you move a candidate between tiers, it will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Candidate</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">From</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground"></th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">To</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Note</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">When</th>
              </tr>
            </thead>
            <tbody>
              {allOverrides.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-foreground font-medium">
                    {o.candidateFileName.replace(/\.[^.]+$/, "")}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${TIER_COLORS[o.fromTier] ?? ""}`}>
                      {TIER_LABELS[o.fromTier] ?? o.fromTier}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${TIER_COLORS[o.toTier] ?? ""}`}>
                      {TIER_LABELS[o.toTier] ?? o.toTier}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted text-xs">{o.note ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                    {new Date(o.createdAt).toLocaleString("en-GB", {
                      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
