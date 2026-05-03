import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/client";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const screenings = await prisma.screening.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { candidates: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(screenings);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { jobTitle, jobDescription, jdFairnessFlags } = body;

  if (!jobTitle?.trim() || !jobDescription?.trim()) {
    return NextResponse.json({ error: "jobTitle and jobDescription are required" }, { status: 400 });
  }

  const screening = await prisma.screening.create({
    data: {
      userId: session.user.id,
      jobTitle: jobTitle.trim(),
      jobDescription: jobDescription.trim(),
      jdFairnessFlags: JSON.stringify(jdFairnessFlags ?? []),
    },
  });

  return NextResponse.json(screening, { status: 201 });
}
