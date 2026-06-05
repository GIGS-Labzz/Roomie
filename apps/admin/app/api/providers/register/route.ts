import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@repo/db/server";

export const runtime = "nodejs";

interface RegisterBody {
  name: string;
  description?: string;
  url: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  cities: string[];
  campus_tags?: string[];
}

export async function POST(req: NextRequest) {
  const body = await req.json() as RegisterBody;

  if (!body.name || !body.url || !body.contact_email || !body.cities?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Basic URL validation
  try { new URL(body.url); } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  // Prevent duplicate registrations by email
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase as any)
    .from("housing_platforms")
    .select("id")
    .eq("contact_email", body.contact_email)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "A platform is already registered with this email. Sign in to check its status." },
      { status: 409 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("housing_platforms")
    .insert({
      name: body.name,
      description: body.description ?? null,
      url: body.url,
      contact_name: body.contact_name,
      contact_email: body.contact_email,
      contact_phone: body.contact_phone ?? null,
      cities: body.cities,
      campus_tags: body.campus_tags ?? [],
      status: "PENDING_REVIEW",
    });

  if (error) {
    return NextResponse.json({ error: "Failed to save registration" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
