import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const { full_name, email, phone, university, city } = body as Record<string, string>;

  if (!full_name?.trim() || !email?.trim() || !phone?.trim() || !university?.trim() || !city?.trim()) {
    return NextResponse.json({ error: "All fields are required" }, { status: 422 });
  }

  const { error } = await supabase.from("waitlist").insert({
    full_name: full_name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    university: university.trim(),
    city: city.trim(),
  });

  if (error) {
    console.error("[waitlist]", error.code, error.message);
    return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
