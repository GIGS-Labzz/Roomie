import crypto from "crypto";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

export interface PaystackInitializeResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface PaystackEvent {
  event: string;
  data: {
    amount: number;
    channel?: string;
    paid_at?: string;
    reference: string;
    gateway_response?: string;
    metadata?: {
      agreement_id?: string;
      connection_id?: string;
      user_id?: string;
      type?: string;
    };
  };
}

export interface PaystackVerifyResponse {
  amount: number;
  channel?: string;
  paid_at?: string;
  reference: string;
  status: string;
  gateway_response?: string;
  metadata?: {
    agreement_id?: string;
    connection_id?: string;
    user_id?: string;
    type?: string;
  };
}

export function getAgreementFeeKobo() {
  return Number(process.env.CONNECTION_FEE_KOBO ?? "200000");
}

export async function initializePaystackTransaction(input: {
  email: string;
  amount: number;
  callbackUrl: string;
  metadata: Record<string, string>;
}): Promise<PaystackInitializeResponse> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured");
  }

  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: input.amount,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
    }),
  });

  const payload = await response.json();
  if (!response.ok || !payload?.status || !payload?.data) {
    throw new Error(payload?.message ?? "Paystack initialization failed");
  }

  return payload.data as PaystackInitializeResponse;
}

export async function verifyPaystackTransaction(reference: string): Promise<PaystackVerifyResponse> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured");
  }

  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: {
      Authorization: `Bearer ${secretKey}`,
    },
  });

  const payload = await response.json();
  if (!response.ok || !payload?.status || !payload?.data) {
    throw new Error(payload?.message ?? "Paystack verification failed");
  }

  return payload.data as PaystackVerifyResponse;
}

export function verifyPaystackSignature(rawBody: string, signature: string | null) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey || !signature) return false;

  const hash = crypto.createHmac("sha512", secretKey).update(rawBody).digest("hex");
  if (hash.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
}
