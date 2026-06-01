import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types";

export async function createPayment(
  supabase: SupabaseClient<Database>,
  data: {
    userId: string;
    connectionId: string;
    reference: string;
    amount: number;
  }
) {
  return supabase
    .from("payments")
    .insert({
      user_id: data.userId,
      connection_id: data.connectionId,
      reference: data.reference,
      amount: data.amount,
      status: "PENDING",
    })
    .select()
    .single();
}

export async function getPaymentByReference(
  supabase: SupabaseClient<Database>,
  reference: string
) {
  return supabase
    .from("payments")
    .select("*")
    .eq("reference", reference)
    .single();
}

export async function updatePaymentStatus(
  supabase: SupabaseClient<Database>,
  reference: string,
  status: Database["public"]["Enums"]["payment_status"],
  extra?: { payment_channel?: string; gateway_response?: string; paid_at?: string }
) {
  return supabase
    .from("payments")
    .update({ status, ...extra })
    .eq("reference", reference);
}
