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
  message_type: "text" | "image" | "system";
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
  messageType: "text" | "image" | "system" = "text",
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
