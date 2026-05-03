import { NextRequest, NextResponse } from "next/server";
import { learningCoach } from "@/lib/ai";
import type { RequirementMatch, Tier } from "@/lib/ai/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tier, requirementMatches, jobDescription } = body as {
      tier: Tier;
      requirementMatches: RequirementMatch[];
      jobDescription: string;
    };

    if (!tier || !requirementMatches || !jobDescription) {
      return NextResponse.json({ error: "tier, requirementMatches, and jobDescription are required" }, { status: 400 });
    }

    const result = await learningCoach(tier, requirementMatches, jobDescription);
    return NextResponse.json({ result });
  } catch (error) {
    console.error("[learning-coach]", error);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "development" ? String(error) : "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
