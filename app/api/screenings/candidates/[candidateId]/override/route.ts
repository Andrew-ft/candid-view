import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/client";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { candidateId } = await params;
  const { newTier, note } = await req.json();

  if (!["STRONG_FIT", "WORTH_A_LOOK", "LIKELY_NOT_A_FIT"].includes(newTier)) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }

  try {
    const candidate = await prisma.candidate.findFirst({
      where: { id: candidateId, screening: { userId: session.user.id } },
    });
    if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const latestOverride = await prisma.override.findFirst({
      where: { candidateId },
      orderBy: { createdAt: "desc" },
    });
    const fromTier = latestOverride?.toTier ?? candidate.tier;

    const override = await prisma.override.create({
      data: {
        candidateId,
        userId: session.user.id,
        fromTier,
        toTier: newTier,
        note: note || null,
      },
    });

    return NextResponse.json(override, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save override" }, { status: 500 });
  }
}
