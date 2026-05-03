import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/client";
import { parseFileBuffer, isSupportedFileType } from "@/lib/parsing";
import { extractRequirements, matchCvToJd } from "@/lib/ai";

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const screeningId = formData.get("screeningId");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }
    if (!screeningId || typeof screeningId !== "string") {
      return NextResponse.json({ error: "screeningId is required" }, { status: 400 });
    }
    if (!isSupportedFileType(file.name)) {
      return NextResponse.json({ error: `Unsupported file type: ${file.name}` }, { status: 400 });
    }

    const screening = await prisma.screening.findFirst({
      where: { id: screeningId, userId: session.user.id },
    });
    if (!screening) {
      return NextResponse.json({ error: "Screening not found" }, { status: 404 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parsedText = await parseFileBuffer(buffer, file.name);

    const requirements = await extractRequirements(screening.jobDescription);
    const matchResult = await matchCvToJd(parsedText, requirements);

    const candidate = await prisma.candidate.create({
      data: {
        screeningId,
        fileName: file.name,
        parsedText,
        tier: matchResult.tier,
        summary: matchResult.summary,
        requirementMatches: JSON.stringify(matchResult.requirementMatches),
        notableContext: matchResult.notableContext,
      },
    });

    return NextResponse.json(candidate, { status: 201 });
  } catch (error) {
    const msg = errorMessage(error);
    console.error("[screenings/candidates]", msg);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "development" ? msg : "CV processing failed" },
      { status: 500 }
    );
  }
}
