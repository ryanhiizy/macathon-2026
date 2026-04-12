import { File as ExpoFile } from "expo-file-system";
import { supabase } from "@/lib/supabase";

type HabitCaptureMeta = {
  id: string;
  name: string;
  circle_id: string;
  target_time: string;
};

type HabitInstanceRow = {
  id: string;
  status: string;
  window_closes_at: string;
};

type VerifyPhotoResponse = {
  passed: boolean;
  reason: string;
  comment: string;
  source: string;
};

type VerifyPhotoResult = {
  passed: boolean;
  reason: string;
  message: string;
  retryHint: string | null;
};

function buildPromptText(habitName: string) {
  return `Show yourself doing ${habitName.toLowerCase()}.`;
}

const EMOJI_RE = /^(\p{Emoji_Presentation}|\p{Extended_Pictographic})\s*/u;

function moveLeadingEmojiToEnd(text: string): string {
  const match = text.match(EMOJI_RE);
  if (!match) return text;
  const emoji = match[1];
  const rest = text.slice(match[0].length);
  return `${rest} ${emoji}`;
}

export async function fetchAIPrompt(habitName: string, participantCount = 1): Promise<string> {
  const baseUrl = process.env.EXPO_PUBLIC_PROMPT_API_URL?.replace(/\/+$/, "");
  if (!baseUrl) {
    return buildPromptText(habitName);
  }

  try {
    const response = await fetch(`${baseUrl}/generate-prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habit: habitName, participant_count: participantCount }),
    });

    if (!response.ok) {
      return buildPromptText(habitName);
    }

    const data = (await response.json()) as { prompt_text?: string };
    const raw = data.prompt_text?.trim() || buildPromptText(habitName);
    return moveLeadingEmojiToEnd(raw);
  } catch {
    return buildPromptText(habitName);
  }
}

function requirePromptApiUrl() {
  const value = process.env.EXPO_PUBLIC_PROMPT_API_URL;

  if (!value) {
    throw new Error("Missing EXPO_PUBLIC_PROMPT_API_URL for photo verification.");
  }

  return value.replace(/\/+$/, "");
}

function buildFriendlyRetryMessage(rawReason: string, rawComment: string): Omit<VerifyPhotoResult, "passed"> {
  const reason = rawReason.trim();
  const normalized = `${rawReason} ${rawComment}`.toLowerCase();

  if (
    normalized.includes("small") ||
    normalized.includes("compressed") ||
    normalized.includes("blurry") ||
    normalized.includes("clearer")
  ) {
    return {
      reason,
      message: "Bit blurry. We can't really see you.",
      retryHint: "Try again with better light and hold still for one beat.",
    };
  }

  if (
    normalized.includes("core action") ||
    normalized.includes("does not clearly show") ||
    normalized.includes("not clearly show") ||
    normalized.includes("obvious")
  ) {
    return {
      reason,
      message: "The camera caught vibes, not proof.",
      retryHint: "Make the main habit action or object super obvious in frame.",
    };
  }

  if (
    normalized.includes("participant") ||
    normalized.includes("group") ||
    normalized.includes("people")
  ) {
    return {
      reason,
      message: "Fun shot, wrong cast list.",
      retryHint: "Try again with everyone the prompt expects clearly visible.",
    };
  }

  return {
    reason,
    message: "Nice try, but the main event is hiding.",
    retryHint: "Retake it with the habit action centered and easy to spot.",
  };
}

function buildScheduledFor(targetTime: string) {
  const now = new Date();
  const [hours = "7", minutes = "0", seconds = "0"] = targetTime.split(":");
  const scheduled = new Date(now);
  scheduled.setHours(Number(hours), Number(minutes), Number(seconds), 0);
  return scheduled.toISOString();
}

function buildWindowClosesAt() {
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay.toISOString();
}

function getLocalDayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

async function fetchHabitCaptureMeta(habitId: string, userId: string): Promise<HabitCaptureMeta> {
  const { data, error } = await supabase
    .from("habits")
    .select("id, name, circle_id, target_time")
    .eq("id", habitId)
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Habit not found.");
  }

  return data;
}

export async function getHabitCaptureMeta(habitId: string, userId: string) {
  return fetchHabitCaptureMeta(habitId, userId);
}

export async function verifySnapPhoto(params: { localUri: string; promptText: string }) {
  const verifyUrl = `${requirePromptApiUrl()}/verify-photo`;

  const formData = new FormData();
  formData.append("prompt_text", params.promptText);
  formData.append("participant_count", "1");
  formData.append("file", {
    uri: params.localUri,
    type: "image/jpeg",
    name: "snap.jpg",
  } as unknown as Blob);

  const response = await fetch(verifyUrl, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const fallbackText = await response.text();
    throw new Error(fallbackText || "Photo verification failed.");
  }

  const result = (await response.json()) as VerifyPhotoResponse;

  if (result.passed) {
    return {
      passed: true,
      reason: result.reason,
      message: result.comment || "Verified.",
      retryHint: null,
    } satisfies VerifyPhotoResult;
  }

  return {
    passed: false,
    ...buildFriendlyRetryMessage(result.reason, result.comment),
  } satisfies VerifyPhotoResult;
}

export async function getOrCreateTodayHabitInstance(habitId: string, userId: string, promptText?: string) {
  const habit = await fetchHabitCaptureMeta(habitId, userId);
  const range = getLocalDayRange();

  const { data: existing, error: existingError } = await supabase
    .from("habit_instances")
    .select("id, status, window_closes_at")
    .eq("habit_id", habitId)
    .gte("scheduled_for", range.start)
    .lt("scheduled_for", range.end)
    .order("scheduled_for", { ascending: false })
    .limit(1)
    .maybeSingle<HabitInstanceRow>();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing?.status === "verified") {
    throw new Error("You already posted this habit today.");
  }

  if (existing) {
    return {
      habit,
      habitInstanceId: existing.id,
    };
  }

  const { data: created, error: createError } = await supabase
    .from("habit_instances")
    .insert({
      habit_id: habitId,
      scheduled_for: buildScheduledFor(habit.target_time),
      window_closes_at: buildWindowClosesAt(),
      prompt_id: `demo-${new Date().toISOString().slice(0, 10)}`,
      prompt_text: promptText || buildPromptText(habit.name),
    })
    .select("id")
    .single();

  if (createError || !created) {
    throw new Error(createError?.message ?? "Failed to create habit instance.");
  }

  return {
    habit,
    habitInstanceId: created.id as string,
  };
}

export async function uploadSnapPhoto(userId: string, circleId: string, localUri: string) {
  const file = new ExpoFile(localUri);
  const arrayBuffer = await file.arrayBuffer();
  const filePath = `${circleId}/${userId}/${Date.now()}.jpg`;

  const { error } = await supabase.storage.from("snaps").upload(filePath, arrayBuffer, {
    contentType: "image/jpeg",
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  return filePath;
}

export async function submitSoloSnap(params: {
  habitId: string;
  userId: string;
  localUri: string;
  caption?: string;
  promptText?: string;
}) {
  const { habit, habitInstanceId } = await getOrCreateTodayHabitInstance(params.habitId, params.userId, params.promptText);
  const storagePath = await uploadSnapPhoto(params.userId, habit.circle_id, params.localUri);
  const caption = params.caption?.trim() || `Checked in for ${habit.name}.`;

  const { data, error } = await supabase.rpc("complete_verified_solo_snap", {
    p_habit_instance_id: habitInstanceId,
    p_storage_path: storagePath,
    p_detected_classes: [],
    p_caption: caption,
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    habit,
    habitInstanceId,
    storagePath,
    snap: Array.isArray(data) ? data[0] : data,
  };
}

export async function submitGroupSnap(params: {
  habitId: string;
  userId: string;
  localUri: string;
  caption?: string;
  promptText?: string;
  participantIds?: string[];
}) {
  // Look up the habit by ID only — group proves don't require ownership
  const { data: habit, error: habitError } = await supabase
    .from("habits")
    .select("id, name, circle_id, target_time")
    .eq("id", params.habitId)
    .single();

  if (habitError || !habit) {
    throw new Error(habitError?.message ?? "Habit not found.");
  }

  // Get or create today's habit instance (shared across participants)
  const range = getLocalDayRange();
  const { data: existing, error: existingError } = await supabase
    .from("habit_instances")
    .select("id, status, window_closes_at")
    .eq("habit_id", params.habitId)
    .gte("scheduled_for", range.start)
    .lt("scheduled_for", range.end)
    .order("scheduled_for", { ascending: false })
    .limit(1)
    .maybeSingle<HabitInstanceRow>();

  if (existingError) {
    throw new Error(existingError.message);
  }

  let habitInstanceId: string;

  if (existing) {
    habitInstanceId = existing.id;
  } else {
    const { data: created, error: createError } = await supabase
      .from("habit_instances")
      .insert({
        habit_id: params.habitId,
        scheduled_for: buildScheduledFor(habit.target_time),
        window_closes_at: buildWindowClosesAt(),
        prompt_id: `demo-group-${new Date().toISOString().slice(0, 10)}`,
        prompt_text: params.promptText || buildPromptText(habit.name),
      })
      .select("id")
      .single();

    if (createError || !created) {
      throw new Error(createError?.message ?? "Failed to create habit instance.");
    }

    habitInstanceId = created.id as string;
  }

  const storagePath = await uploadSnapPhoto(params.userId, habit.circle_id, params.localUri);
  const caption = params.caption?.trim() || `Group prove for ${habit.name}.`;

  const { data, error } = await supabase.rpc("complete_verified_solo_snap", {
    p_habit_instance_id: habitInstanceId,
    p_storage_path: storagePath,
    p_detected_classes: [],
    p_caption: caption,
  });

  if (error) {
    throw new Error(error.message);
  }

  // Flag as group post and insert circle members as participants
  const snapResult = Array.isArray(data) ? data[0] : data;
  if (snapResult?.snap_id) {
    await supabase
      .from("snaps")
      .update({ is_group_post: true })
      .eq("id", snapResult.snap_id);

    // Insert the author + invited participants as snap_participants
    const allParticipantIds = [
      params.userId,
      ...(params.participantIds ?? []),
    ].filter((pid, i, arr) => arr.indexOf(pid) === i); // dedupe

    // Fetch streaks for all participants
    const { data: memberStreaks } = await supabase
      .from("circle_members")
      .select("user_id, current_streak")
      .in("user_id", allParticipantIds);

    const streakMap = new Map(
      (memberStreaks ?? []).map((m: { user_id: string; current_streak: number }) => [
        m.user_id,
        m.current_streak,
      ]),
    );

    const participantRows = allParticipantIds.map((uid) => ({
      snap_id: snapResult.snap_id,
      user_id: uid,
      streak_after_completion: streakMap.get(uid) ?? 0,
    }));

    await supabase.from("snap_participants").upsert(participantRows, {
      onConflict: "snap_id,user_id",
      ignoreDuplicates: true,
    });
  }

  return {
    habit,
    habitInstanceId,
    storagePath,
    snap: snapResult,
  };
}
