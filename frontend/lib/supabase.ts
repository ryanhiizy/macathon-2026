import { createClient, type Session, type User } from "@supabase/supabase-js";
import { authStorage } from "@/lib/auth-storage";

const supabaseUrl = requireEnv("EXPO_PUBLIC_SUPABASE_URL");
const supabaseClientKey = requireClientKey();

export const supabase = createClient(supabaseUrl, supabaseClientKey, {
  auth: {
    storage: authStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type AppProfile = {
  id: string;
  display_name: string;
  handle: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
};

export type PendingSignupDraft = {
  displayName: string;
  username: string;
  email: string;
  birthDate: string;
  gender: string | null;
};

const PENDING_SIGNUP_KEY = "presence.pending-signup";

// Dev-only: hardcoded test user. Main branch habit screens still depend on this.
export const TEST_USER_EMAIL = "jacknguyen9605@gmail.com";
export const TEST_USER_PASSWORD = "!Macathon2026";
let testUserId = "bf770168-42eb-4b91-b141-81ecec8385ea";

export function getTestUserId() {
  return testUserId;
}

export async function ensureTestSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    testUserId = session.user.id;
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD,
  });

  if (error || !data.user) {
    console.warn("[supabase] auth failed:", error?.message);
    return;
  }

  testUserId = data.user.id;
}

export async function createSessionFromUrl(url: string): Promise<Session | null> {
  const params = extractParamsFromUrl(url);
  const authError = params.get("error_description") ?? params.get("error_code");

  if (authError) {
    throw new Error(authError);
  }

  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  if (accessToken && refreshToken) {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      throw error;
    }

    return data.session;
  }

  const code = params.get("code");

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      throw error;
    }

    return data.session;
  }

  return null;
}

export async function ensureProfile(user: User, draft?: PendingSignupDraft | null) {
  const email = user.email;

  if (!email) {
    throw new Error("Signed-in user is missing an email address.");
  }

  const normalizedDraft = normalizePendingSignupDraft(draft);

  if (normalizedDraft) {
    const { error: userUpdateError } = await supabase.auth.updateUser({
      data: {
        birth_date: normalizedDraft.birthDate,
        gender: normalizedDraft.gender,
      },
    });

    if (userUpdateError) {
      throw userUpdateError;
    }
  }

  const { data: existingProfile, error: fetchError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  if (existingProfile) {
    return;
  }

  const defaults = buildProfileDefaults(email, user.id);
  const handle = normalizedDraft?.username || defaults.handle;
  const displayName = normalizedDraft?.displayName || defaults.displayName;

  const { error } = await supabase.from("profiles").insert({
    id: user.id,
    display_name: displayName,
    handle,
  });

  if (error) {
    throw error;
  }
}

export function buildProfileDefaults(email: string, userId: string) {
  const localPart = email.split("@")[0] ?? "presence";
  const cleaned = localPart.trim().toLowerCase();
  const handleBase = cleaned.replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "presence";
  const shortId = userId.replace(/-/g, "").slice(0, 8).toLowerCase();
  const handle = `${handleBase.slice(0, 18)}_${shortId}`;
  const displayName =
    cleaned
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
      .join(" ") || "Presence User";

  return {
    displayName,
    handle,
  };
}

export async function savePendingSignupDraft(draft: PendingSignupDraft) {
  await authStorage.setItem(PENDING_SIGNUP_KEY, JSON.stringify(draft));
}

export async function loadPendingSignupDraft() {
  const raw = await authStorage.getItem(PENDING_SIGNUP_KEY);

  if (!raw) {
    return null;
  }

  try {
    return normalizePendingSignupDraft(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function clearPendingSignupDraft() {
  await authStorage.removeItem(PENDING_SIGNUP_KEY);
}

export function normalizeUsername(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^@+/, "")
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 24);
}

export function isValidBirthDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime());
}

export function formatAuthEmailError(error: unknown) {
  const message =
    error instanceof Error ? error.message : typeof error === "string" ? error : "Failed to send magic link.";
  const normalized = message.trim().toLowerCase();

  if (
    normalized.includes("email rate limit exceeded") ||
    normalized.includes("over_email_send_rate_limit") ||
    normalized.includes("for security purposes, you can only request this after")
  ) {
    return "A magic link was already sent recently. Check inbox and spam, then wait 10 to 60 seconds before trying again.";
  }

  if (normalized.includes("invalid redirect") || normalized.includes("redirect")) {
    return "This magic link redirect is not allowed yet. Add the current Expo callback URL in Supabase Auth redirect settings.";
  }

  return message;
}

function extractParamsFromUrl(url: string) {
  const params = new URLSearchParams();
  const query = url.split("?")[1]?.split("#")[0];
  const hash = url.split("#")[1];

  if (query) {
    for (const [key, value] of new URLSearchParams(query).entries()) {
      params.set(key, value);
    }
  }

  if (hash) {
    for (const [key, value] of new URLSearchParams(hash).entries()) {
      params.set(key, value);
    }
  }

  return params;
}

function requireEnv(name: "EXPO_PUBLIC_SUPABASE_URL") {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }

  return value;
}

function requireClientKey() {
  const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (publishableKey) {
    return publishableKey;
  }

  if (anonKey) {
    return anonKey;
  }

  throw new Error(
    "Missing required env var: EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY or EXPO_PUBLIC_SUPABASE_ANON_KEY",
  );
}

function normalizePendingSignupDraft(draft?: PendingSignupDraft | null) {
  if (!draft) {
    return null;
  }

  const normalizedEmail = draft.email.trim().toLowerCase();
  const normalizedUsername = normalizeUsername(draft.username);
  const normalizedDisplayName = draft.displayName.trim();
  const normalizedBirthDate = draft.birthDate.trim();
  const normalizedGender = draft.gender?.trim() || null;

  if (!normalizedEmail || !normalizedUsername || !normalizedDisplayName || !normalizedBirthDate) {
    return null;
  }

  return {
    displayName: normalizedDisplayName,
    username: normalizedUsername,
    email: normalizedEmail,
    birthDate: normalizedBirthDate,
    gender: normalizedGender,
  };
}
