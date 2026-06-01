import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types";

export interface PostProfile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  university: string | null;
  city: string | null;
  student_verified: boolean | null;
}

export interface Post {
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
  author: PostProfile;
  liked_by_me?: boolean;
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
  content,
  city,
  budget_min,
  budget_max,
  move_in_date,
  likes_count,
  comments_count,
  created_at,
  author:profiles!posts_user_id_fkey (
    id, display_name, avatar_url, university, city, student_verified
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
  }
): Promise<{ id: string } | null> {
  const db = supabase as AnyClient;
  const { data, error } = await db
    .from("posts")
    .insert({ user_id: userId, ...payload })
    .select("id")
    .single();

  if (error || !data) return null;
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
  userId: string
): Promise<boolean> {
  const db = supabase as AnyClient;
  const { error } = await db
    .from("post_likes")
    .insert({ post_id: postId, user_id: userId });
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
        id, display_name, avatar_url, university, city, student_verified
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
        id, display_name, avatar_url, university, city, student_verified
      )
    `)
    .single();

  if (error || !data) return null;
  return data as PostComment;
}
