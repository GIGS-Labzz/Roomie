import { createServiceClient, createServerClient } from "@repo/db/server";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { action } = await request.json();

  if (action !== "approve" && action !== "decline") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  // Get current user to verify authorization
  const client = await createServerClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Use service role client to fetch and update message
  const db = await createServiceClient();
  const { data: message, error: fetchErr } = await db
    .from("messages")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchErr || !message) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  // Parse message content
  let payload: any = {};
  try {
    payload = JSON.parse(message.content);
  } catch (e) {
    return NextResponse.json({ error: "Invalid message payload" }, { status: 400 });
  }

  // Verify the current user is the target of the request
  if (payload.target_id !== user.id) {
    return NextResponse.json({ error: "Forbidden: You are not the target of this request" }, { status: 403 });
  }

  // Update status
  payload.status = action === "approve" ? "approved" : "declined";

  const { error: updateErr } = await db
    .from("messages")
    .update({ content: JSON.stringify(payload) })
    .eq("id", id);

  if (updateErr) {
    return NextResponse.json({ error: "Failed to update request status" }, { status: 500 });
  }

  return NextResponse.json({ success: true, status: payload.status });
}
