import { supabase, getTestUserId } from "./supabase";

/** Check if the current user has liked a snap, and get total count. */
export async function fetchLikeState(snapId: string) {
  const userId = getTestUserId();

  const [{ count }, { data: myLike }] = await Promise.all([
    supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("snap_id", snapId),
    supabase
      .from("likes")
      .select("snap_id")
      .eq("snap_id", snapId)
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  return { count: count ?? 0, liked: !!myLike };
}

/** Toggle like. Returns the new liked state. */
export async function toggleLike(snapId: string): Promise<boolean> {
  const userId = getTestUserId();

  // Check current state
  const { data: existing } = await supabase
    .from("likes")
    .select("snap_id")
    .eq("snap_id", snapId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("likes")
      .delete()
      .eq("snap_id", snapId)
      .eq("user_id", userId);
    return false;
  } else {
    await supabase
      .from("likes")
      .insert({ snap_id: snapId, user_id: userId });
    return true;
  }
}
