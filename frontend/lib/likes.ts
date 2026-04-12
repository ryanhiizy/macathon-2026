import { supabase } from "./supabase";

async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/** Check if the current user has liked a post, and get total count. */
export async function fetchLikeState(postId: string) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return { count: 0, liked: false };
  }

  const [{ count }, { data: myLike }] = await Promise.all([
    supabase
      .from("post_likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId),
    supabase
      .from("post_likes")
      .select("post_id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  return { count: count ?? 0, liked: !!myLike };
}

/** Toggle like. Returns the new liked state. */
export async function toggleLike(postId: string): Promise<boolean> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return false;
  }

  // Check current state
  const { data: existing } = await supabase
    .from("post_likes")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("post_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);
    return false;
  } else {
    await supabase
      .from("post_likes")
      .insert({ post_id: postId, user_id: userId });
    return true;
  }
}

/** Fetch like counts for multiple posts in one call. */
export async function fetchLikeCounts(
  postIds: string[],
): Promise<Record<string, number>> {
  if (postIds.length === 0) return {};

  const { data } = await supabase
    .from("post_likes")
    .select("post_id")
    .in("post_id", postIds);

  const counts: Record<string, number> = {};
  for (const id of postIds) counts[id] = 0;
  for (const row of data ?? []) {
    counts[row.post_id] = (counts[row.post_id] ?? 0) + 1;
  }
  return counts;
}
