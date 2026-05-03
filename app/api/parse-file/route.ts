import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { parseFileBuffer, isSupportedFileType } from "@/lib/parsing";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }
  if (!isSupportedFileType(file.name)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await parseFileBuffer(buffer, file.name);
    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ error: "Failed to parse file" }, { status: 500 });
  }
}
