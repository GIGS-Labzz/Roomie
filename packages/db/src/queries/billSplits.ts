import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types";

export async function getBillSplitsForConnection(
  supabase: SupabaseClient<Database>,
  connectionId: string
) {
  return supabase
    .from("bill_splits")
    .select(`
      *,
      creator:profiles!created_by(id, display_name, avatar_url),
      items:bill_split_items(
        id, user_id, description, amount, is_paid, paid_at,
        user:profiles!user_id(id, display_name, avatar_url)
      )
    `)
    .eq("connection_id", connectionId)
    .order("created_at", { ascending: false });
}

export async function getAllBillSplitsForUser(
  supabase: SupabaseClient<Database>,
  userId: string
) {
  // Get all splits across all connections the user is part of
  const { data: connections } = await supabase
    .from("connections")
    .select("id")
    .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
    .eq("status", "ACTIVE");

  if (!connections || connections.length === 0) return { data: [], error: null };

  const connectionIds = connections.map((c) => c.id);

  return supabase
    .from("bill_splits")
    .select(`
      *,
      creator:profiles!created_by(id, display_name, avatar_url),
      items:bill_split_items(
        id, user_id, description, amount, is_paid, paid_at,
        user:profiles!user_id(id, display_name, avatar_url)
      ),
      connection:connections!connection_id(
        id, requester_id, receiver_id,
        requester:profiles!requester_id(id, display_name, avatar_url),
        receiver:profiles!receiver_id(id, display_name, avatar_url)
      )
    `)
    .in("connection_id", connectionIds)
    .order("created_at", { ascending: false });
}

export async function getBillSplitById(
  supabase: SupabaseClient<Database>,
  splitId: string
) {
  return supabase
    .from("bill_splits")
    .select(`
      *,
      creator:profiles!created_by(id, display_name, avatar_url),
      items:bill_split_items(
        id, user_id, description, amount, is_paid, paid_at,
        user:profiles!user_id(id, display_name, avatar_url)
      )
    `)
    .eq("id", splitId)
    .single();
}

export async function createBillSplit(
  supabase: SupabaseClient<Database>,
  params: {
    connectionId: string;
    createdBy: string;
    title: string;
    description?: string;
    totalAmount: number;
    shares: { userId: string; amount: number; description?: string }[];
  }
) {
  const { data: split, error } = await supabase
    .from("bill_splits")
    .insert({
      connection_id: params.connectionId,
      created_by: params.createdBy,
      title: params.title,
      description: params.description ?? null,
      total_amount: params.totalAmount,
      currency: "NGN",
      is_settled: false,
    })
    .select()
    .single();

  if (error || !split) return { data: null, error };

  const items = params.shares.map((s) => ({
    split_id: split.id,
    user_id: s.userId,
    description: s.description ?? null,
    amount: s.amount,
    is_paid: false,
  }));

  const { error: itemsError } = await supabase
    .from("bill_split_items")
    .insert(items);

  if (itemsError) return { data: null, error: itemsError };

  return { data: split, error: null };
}

export async function markSplitItemPaid(
  supabase: SupabaseClient<Database>,
  itemId: string
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any)
    .from("bill_split_items")
    .update({ is_paid: true, paid_at: new Date().toISOString(), payment_status: "full" })
    .eq("id", itemId)
    .select()
    .single();
}

export async function markSplitItemUnpaid(
  supabase: SupabaseClient<Database>,
  itemId: string
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any)
    .from("bill_split_items")
    .update({ is_paid: false, paid_at: null, amount_paid: null, payment_status: "unpaid", proof_url: null })
    .eq("id", itemId)
    .select()
    .single();
}

export async function updateSplitItemProof(
  supabase: SupabaseClient<Database>,
  itemId: string,
  params: {
    proofUrl: string;
    amountPaid: number;       // kobo
    paymentStatus: "full" | "partial" | "unpaid";
  }
) {
  const isPaid = params.paymentStatus === "full";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any)
    .from("bill_split_items")
    .update({
      proof_url: params.proofUrl,
      amount_paid: params.amountPaid,
      payment_status: params.paymentStatus,
      is_paid: isPaid,
      paid_at: isPaid ? new Date().toISOString() : null,
    })
    .eq("id", itemId)
    .select()
    .single();
}

export async function settleBillSplit(
  supabase: SupabaseClient<Database>,
  splitId: string
) {
  return supabase
    .from("bill_splits")
    .update({ is_settled: true })
    .eq("id", splitId)
    .select()
    .single();
}
