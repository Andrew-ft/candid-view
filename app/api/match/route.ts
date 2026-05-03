import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { extractRequirements, matchCvToJd } from "@/lib/ai";
import { parseFileBuffer, isSupportedFileType } from "@/lib/parsing";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { cvText, jobDescription } = body as { cvText: string; jobDescription: string };

    if (!cvText || !jobDescription) {
      return NextResponse.json({ error: "cvText and jobDescription are required" }, { status: 400 });
    }

    const requirements = await extractRequirements(jobDescription);
    const matchResult = await matchCvToJd(cvText, requirements);

    return NextResponse.json({ result: matchResult, requirements });
  } catch (error) {
    console.error("[match]", error);
    return NextResponse.json({ error: "Matching failed" }, { status: 500 });
  }
}
