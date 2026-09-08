import { NextRequest, NextResponse } from "next/server";
import { validateRegNumber } from "@/lib/universityPatterns";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { institution, regNumber } = body;

    if (!institution || !regNumber) {
      return NextResponse.json({ error: "Institution and regNumber are required" }, { status: 400 });
    }

    const result = validateRegNumber(institution, regNumber);

    return NextResponse.json({
      valid: result.valid,
      hint: result.hint,
      institutionMatched: !!result.matchedPattern,
    });
  } catch (err: unknown) {
    console.error("[Institution Validate API Error]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
