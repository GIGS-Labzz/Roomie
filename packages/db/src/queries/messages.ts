// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

export interface MessageAuthor {
  id: string;
  display_name: string;
  avatar_url: string | null;
}

export interface Message {
  id: string;
  connection_id: string;
  sender_id: string;
  content: string;
  message_type: "text" | "image" | "system" | "agreement_request" | "agreement_confirmed" | "agreement_declined" | "bill_split";
  image_url: string | null;
  read_at: string | null;
  created_at: string;
  sender?: MessageAuthor;
}

const PAGE_SIZE = 60;

export async function getMessages(
  supabase: AnyClient,
  connectionId: string,
  page = 0
): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select(`
      id, connection_id, sender_id, content, message_type,
      image_url, read_at, created_at,
      sender:profiles!sender_id(id, display_name, avatar_url)
    `)
    .eq("connection_id", connectionId)
    .order("created_at", { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

  if (error || !data) return [];
  // Reverse so oldest-first for display
  return (data as Message[]).reverse();
}

export async function sendMessage(
  supabase: AnyClient,
  connectionId: string,
  senderId: string,
  content: string,
  messageType: "text" | "image" | "system" | "agreement_request" | "agreement_confirmed" | "agreement_declined" | "bill_split" = "text",
  imageUrl?: string
): Promise<Message | null> {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      connection_id: connectionId,
      sender_id: senderId,
      content,
      message_type: messageType,
      image_url: imageUrl ?? null,
    })
    .select(`
      id, connection_id, sender_id, content, message_type,
      image_url, read_at, created_at,
      sender:profiles!sender_id(id, display_name, avatar_url)
    `)
    .single();

  if (error || !data) return null;
  return data as Message;
}

export async function markMessagesRead(
  supabase: AnyClient,
  connectionId: string,
  readerId: string
): Promise<void> {
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("connection_id", connectionId)
    .neq("sender_id", readerId)
    .is("read_at", null);
}

export interface LastMessagePreview {
  connection_id: string;
  content: string;
  sender_id: string;
  created_at: string;
  message_type: string;
}

export async function getLastMessagesForConnections(
  supabase: AnyClient,
  connectionIds: string[]
): Promise<Record<string, LastMessagePreview>> {
  if (!connectionIds.length) return {};

  const { data } = await supabase
    .from("messages")
    .select("connection_id, content, sender_id, created_at, message_type")
    .in("connection_id", connectionIds)
    .order("created_at", { ascending: false })
    .limit(500);

  const result: Record<string, LastMessagePreview> = {};
  for (const msg of (data ?? []) as LastMessagePreview[]) {
    if (!result[msg.connection_id]) result[msg.connection_id] = msg;
  }
  return result;
}

export async function getUnreadCountPerConnection(
  supabase: AnyClient,
  connectionIds: string[],
  userId: string
): Promise<Record<string, number>> {
  if (!connectionIds.length) return {};

  const { data } = await supabase
    .from("messages")
    .select("connection_id")
    .in("connection_id", connectionIds)
    .neq("sender_id", userId)
    .is("read_at", null);

  const result: Record<string, number> = {};
  for (const msg of (data ?? []) as { connection_id: string }[]) {
    result[msg.connection_id] = (result[msg.connection_id] ?? 0) + 1;
  }
  return result;
}
