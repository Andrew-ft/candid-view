import { NextRequest, NextResponse } from "next/server";
import { candidateSelfCheck } from "@/lib/ai";
import { parseFileBuffer, isSupportedFileType } from "@/lib/parsing";

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    let jdText = "";
    let cvText = "";

    const jdField = formData.get("jd");
    const cvField = formData.get("cv");
    const jdFile = formData.get("jdFile");
    const cvFile = formData.get("cvFile");

    if (jdFile && jdFile instanceof File) {
      if (!isSupportedFileType(jdFile.name)) {
        return NextResponse.json({ error: "Unsupported JD file type" }, { status: 400 });
      }
      const buffer = Buffer.from(await jdFile.arrayBuffer());
      jdText = await parseFileBuffer(buffer, jdFile.name);
    } else if (typeof jdField === "string") {
      jdText = jdField.trim();
    }

    if (cvFile && cvFile instanceof File) {
      if (!isSupportedFileType(cvFile.name)) {
        return NextResponse.json({ error: "Unsupported CV file type" }, { status: 400 });
      }
      const buffer = Buffer.from(await cvFile.arrayBuffer());
      cvText = await parseFileBuffer(buffer, cvFile.name);
    } else if (typeof cvField === "string") {
      cvText = cvField.trim();
    }

    if (!jdText) {
      return NextResponse.json({ error: "Job description is required" }, { status: 400 });
    }
    if (!cvText) {
      return NextResponse.json({ error: "CV is required" }, { status: 400 });
    }

    if (jdText.length > 20000 || cvText.length > 20000) {
      return NextResponse.json(
        { error: "Text is too long (max 20,000 characters each)" },
        { status: 400 }
      );
    }

    const result = await candidateSelfCheck(cvText, jdText);
    return NextResponse.json({ result, jdText });
  } catch (error) {
    const msg = errorMessage(error);
    console.error("[candidate-check]", msg);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "development" ? msg : "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
