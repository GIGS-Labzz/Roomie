import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types";

export interface PostProfile {
  id: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
  university: string | null;
  city: string | null;
  student_verified: boolean | null;
}

export interface Post {
  id: string;
  user_id: string;
  parent_post_id?: string | null;
  content: string;
  city: string | null;
  budget_min: number | null;
  budget_max: number | null;
  move_in_date: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  is_archived: boolean;
  is_pinned: boolean;
  reactions: {
    love: number;
    laughter: number;
    confusion: number;
    applause: number;
    anger: number;
  };
  parent_post?: {
    id: string;
    content: string;
    created_at: string;
    author: {
      id: string;
      display_name: string;
      username: string | null;
      avatar_url: string | null;
    };
  } | null;
  author: PostProfile;
  liked_by_me?: boolean;
  my_reaction?: string | null;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author: PostProfile;
}

const AUTHOR_SELECT = `
  id,
  user_id,
  parent_post_id,
  content,
  city,
  budget_min,
  budget_max,
  move_in_date,
  likes_count,
  comments_count,
  reactions,
  created_at,
  is_archived,
  is_pinned,
  author:profiles!posts_user_id_fkey (
    id, display_name, username, avatar_url, university, city, student_verified
  ),
  parent_post:parent_post_id (
    id,
    content,
    created_at,
    author:profiles!posts_user_id_fkey (
      id, display_name, username, avatar_url
    )
  )
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

export async function getFeed(
  supabase: AnyClient,
  page = 0
): Promise<Post[]> {
  const PAGE_SIZE = 20;
  const db = supabase as AnyClient;
  const { data, error } = await db
    .from("posts")
    .select(AUTHOR_SELECT)
    .eq("is_archived", false)
    .order("created_at", { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

  if (error || !data) return [];
  return data as Post[];
}

export async function getPostById(
  supabase: AnyClient,
  postId: string
): Promise<Post | null> {
  const db = supabase as AnyClient;
  const { data, error } = await db
    .from("posts")
    .select(AUTHOR_SELECT)
    .eq("id", postId)
    .single();

  if (error || !data) return null;
  return data as Post;
}

export async function createPost(
  supabase: AnyClient,
  userId: string,
  payload: {
    content: string;
    city?: string | null;
    budget_min?: number | null;
    budget_max?: number | null;
    move_in_date?: string | null;
    parent_post_id?: string | null;
  }
): Promise<{ id: string } | null> {
  const db = supabase as AnyClient;
  const { data, error } = await db
    .from("posts")
    .insert({ user_id: userId, ...payload })
    .select("id")
    .single();

  if (error || !data) return null;

  const postId = data.id;

  // Process mentions and replies notifications
  try {
    const { data: sender } = await db
      .from("profiles")
      .select("display_name, username")
      .eq("id", userId)
      .single();

    if (sender) {
      const senderName = sender.display_name || `@${sender.username}`;

      // Notify parent post author
      if (payload.parent_post_id) {
        const { data: parentPost } = await db
          .from("posts")
          .select("user_id")
          .eq("id", payload.parent_post_id)
          .single();

        if (parentPost && parentPost.user_id !== userId) {
          await db.from("notifications").insert({
            user_id: parentPost.user_id,
            type: "POST_REPLY",
            title: "New reply on your post",
            body: `${senderName} (@${sender.username}) replied to your post`,
            data: { post_id: postId, sender_id: userId }
          });
        }
      }

      // Notify mentioned users
      const mentions = [...payload.content.matchAll(/@([a-zA-Z0-9_]+)/g)].map(
        (m) => m[1]
      );
      if (mentions.length > 0) {
        const uniqueMentions = [...new Set(mentions)];
        const { data: targets } = await db
          .from("profiles")
          .select("id, username")
          .in("username", uniqueMentions);

        if (targets && targets.length > 0) {
          for (const target of targets) {
            if (target.id !== userId) {
              await db.from("notifications").insert({
                user_id: target.id,
                type: "POST_TAG",
                title: "New mention",
                body: `${senderName} (@${sender.username}) tagged you in a post`,
                data: { post_id: postId, sender_id: userId }
              });
            }
          }
        }
      }
    }
  } catch (err) {
    console.error("Failed to process notifications for post:", err);
  }

  return data as { id: string };
}

export async function deletePost(
  supabase: AnyClient,
  postId: string
): Promise<boolean> {
  const db = supabase as AnyClient;
  const { error } = await db.from("posts").delete().eq("id", postId);
  return !error;
}

export async function likePost(
  supabase: AnyClient,
  postId: string,
  userId: string,
  reactionType = "love"
): Promise<boolean> {
  const db = supabase as AnyClient;
  const { error } = await db
    .from("post_likes")
    .upsert(
      { post_id: postId, user_id: userId, type: reactionType },
      { onConflict: "post_id,user_id" }
    );
  return !error;
}

export async function unlikePost(
  supabase: AnyClient,
  postId: string,
  userId: string
): Promise<boolean> {
  const db = supabase as AnyClient;
  const { error } = await db
    .from("post_likes")
    .delete()
    .eq("post_id", postId)
    .eq("user_id", userId);
  return !error;
}

export async function getLikedPostIds(
  supabase: AnyClient,
  userId: string,
  postIds: string[]
): Promise<string[]> {
  if (!postIds.length) return [];
  const db = supabase as AnyClient;
  const { data } = await db
    .from("post_likes")
    .select("post_id")
    .eq("user_id", userId)
    .in("post_id", postIds);

  return ((data ?? []) as Array<{ post_id: string }>).map((r) => r.post_id);
}

export async function getUserReactions(
  supabase: AnyClient,
  userId: string,
  postIds: string[]
): Promise<Record<string, string>> {
  if (!postIds.length) return {};
  const db = supabase as AnyClient;
  const { data, error } = await db
    .from("post_likes")
    .select("post_id, type")
    .eq("user_id", userId)
    .in("post_id", postIds);

  if (error || !data) return {};
  const mapping: Record<string, string> = {};
  for (const r of data) {
    mapping[r.post_id] = r.type;
  }
  return mapping;
}

export async function getComments(
  supabase: AnyClient,
  postId: string
): Promise<PostComment[]> {
  const db = supabase as AnyClient;
  const { data, error } = await db
    .from("post_comments")
    .select(`
      id, post_id, user_id, content, created_at,
      author:profiles!post_comments_user_id_fkey (
        id, display_name, username, avatar_url, university, city, student_verified
      )
    `)
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data as PostComment[];
}

export async function addComment(
  supabase: AnyClient,
  postId: string,
  userId: string,
  content: string
): Promise<PostComment | null> {
  const db = supabase as AnyClient;
  const { data, error } = await db
    .from("post_comments")
    .insert({ post_id: postId, user_id: userId, content })
    .select(`
      id, post_id, user_id, content, created_at,
      author:profiles!post_comments_user_id_fkey (
        id, display_name, username, avatar_url, university, city, student_verified
      )
    `)
    .single();

  if (error || !data) return null;
  return data as PostComment;
}

export interface PostWithLikes {
  id: string;
  user_id: string;
  content: string;
  city: string | null;
  budget_min: number | null;
  budget_max: number | null;
  move_in_date: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  is_archived: boolean;
  is_pinned: boolean;
  parent_post_id?: string | null;
  reactions: {
    love: number;
    laughter: number;
    confusion: number;
    applause: number;
    anger: number;
  };
  post_likes: Array<{
    user_id: string;
    type: string;
    profiles: {
      display_name: string;
      avatar_url: string | null;
    } | null;
  }>;
}

export async function getUserPosts(
  supabase: AnyClient,
  userId: string
): Promise<PostWithLikes[]> {
  const db = supabase as AnyClient;
  const { data, error } = await db
    .from("posts")
    .select(`
      id,
      user_id,
      parent_post_id,
      content,
      city,
      budget_min,
      budget_max,
      move_in_date,
      likes_count,
      comments_count,
      reactions,
      created_at,
      is_archived,
      is_pinned,
      post_likes (
        user_id,
        type,
        profiles (
          display_name,
          avatar_url
        )
      ),
      parent_post:parent_post_id (
        id,
        content,
        created_at,
        author:profiles!posts_user_id_fkey (
          id, display_name, username, avatar_url
        )
      )
    `)
    .eq("user_id", userId)
    .eq("is_archived", false)
    .order("is_pinned", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as any[];
}

