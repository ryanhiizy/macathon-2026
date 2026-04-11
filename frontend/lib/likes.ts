import { supabase } from "./supabase";

async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/** Check if the current user has liked a snap, and get total count. */
export async function fetchLikeState(snapId: string) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return { count: 0, liked: false };
  }

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
  const userId = await getCurrentUserId();

  if (!userId) {
    return false;
  }

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
