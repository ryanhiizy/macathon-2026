import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ---------------------------------------------------------------------------
// Dev-only: hardcoded test user. Replace with real auth later.
// Create this user in the Supabase dashboard → Authentication → Users.
// ---------------------------------------------------------------------------
export const TEST_USER_EMAIL = "jacknguyen9605@gmail.com";
export const TEST_USER_PASSWORD = "!Macathon2026";
// After sign-in, this will be populated with the real uuid from Supabase.
let _testUserId = "bf770168-42eb-4b91-b141-81ecec8385ea";
export function getTestUserId() {
  return _testUserId;
}

/**
 * Sign in the hardcoded test user so RLS policies pass.
 * Call once on app start. Safe to call multiple times — skips if already signed in.
 */
export async function ensureTestSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) {
    _testUserId = session.user.id;
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

  _testUserId = data.user.id;
}
