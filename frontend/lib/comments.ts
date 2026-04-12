import { supabase } from "./supabase";

export type CommentRow = {
  id: string;
  post_id: string;
  user_id: string;
  display_name: string;
  handle: string;
  avatar_color: string;
  avatar_letter: string;
  body: string;
  created_at: string;
};

/** Fetch all comments for a post, oldest first. */
export async function fetchComments(postId: string): Promise<CommentRow[]> {
  const { data } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  return (data as CommentRow[] | null) ?? [];
}

/** Post a new comment. Returns the inserted row. */
export async function postComment(
  postId: string,
  body: string,
  user: {
    id: string;
    name: string;
    handle: string;
    color: string;
    letter: string;
  },
): Promise<CommentRow> {
  const { data, error } = await supabase
    .from("comments")
    .insert({
      post_id: postId,
      user_id: user.id,
      display_name: user.name,
      handle: user.handle,
      avatar_color: user.color,
      avatar_letter: user.letter,
      body,
    })
    .select()
    .single();

  if (error) throw error;
  return data as CommentRow;
}

/** Fetch comment counts for multiple posts in one call. */
export async function fetchCommentCounts(
  postIds: string[],
): Promise<Record<string, number>> {
  if (postIds.length === 0) return {};

  const { data } = await supabase
    .from("comments")
    .select("post_id")
    .in("post_id", postIds);

  const counts: Record<string, number> = {};
  for (const id of postIds) counts[id] = 0;
  for (const row of data ?? []) {
    counts[row.post_id] = (counts[row.post_id] ?? 0) + 1;
  }
  return counts;
}
