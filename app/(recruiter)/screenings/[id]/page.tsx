import { auth } from "@/auth";
import { prisma } from "@/lib/db/client";
import { notFound } from "next/navigation";
import ResultsDashboard from "./ResultsDashboard";
import type { RequirementMatch } from "@/lib/ai/types";

export default async function ScreeningPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const screening = await prisma.screening.findFirst({
    where: { id, userId: session!.user.id },
    include: {
      candidates: {
        include: { overrides: { orderBy: { createdAt: "desc" }, take: 1 } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!screening) notFound();

  const candidates = screening.candidates.map((c) => ({
    ...c,
    requirementMatches: JSON.parse(c.requirementMatches) as RequirementMatch[],
    currentTier: c.overrides[0]?.toTier ?? c.tier,
  }));

  return (
    <ResultsDashboard
      screening={{
        id: screening.id,
        jobTitle: screening.jobTitle,
        candidateCount: candidates.length,
      }}
      candidates={candidates}
    />
  );
}
