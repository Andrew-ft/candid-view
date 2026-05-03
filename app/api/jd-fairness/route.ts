import { NextRequest, NextResponse } from "next/server";
import { checkJdFairness } from "@/lib/ai";

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobDescription } = body as { jobDescription: string };

    if (!jobDescription?.trim()) {
      return NextResponse.json({ error: "jobDescription is required" }, { status: 400 });
    }

    const result = await checkJdFairness(jobDescription);
    return NextResponse.json({ result });
  } catch (error) {
    const msg = errorMessage(error);
    console.error("[jd-fairness]", msg);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "development" ? msg : "Fairness check failed" },
      { status: 500 }
    );
  }
}
