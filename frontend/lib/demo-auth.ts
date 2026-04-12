import { authStorage } from "@/lib/auth-storage";
import { normalizeUsername } from "@/lib/supabase";

export type DemoSession = {
  id: string;
  email: string;
  displayName: string;
  handle: string;
  bio: string;
  createdAt: string;
  isDemo: true;
};

const DEMO_AUTH_KEY = "presence.demo-auth";
const listeners = new Set<(session: DemoSession | null) => void>();

export async function signInDemoUser() {
  const session: DemoSession = {
    id: "demo-user",
    email: "demo@presence.club",
    displayName: "Demo User",
    handle: "demo_mode",
    bio: "Hackathon demo account. Use this when Supabase email auth is being slow or rate-limited.",
    createdAt: new Date().toISOString(),
    isDemo: true,
  };

  await authStorage.setItem(DEMO_AUTH_KEY, JSON.stringify(session));
  emit(session);
  return session;
}

export async function getDemoSession() {
  const raw = await authStorage.getItem(DEMO_AUTH_KEY);

  if (!raw) {
    return null;
  }

  try {
    return normalizeDemoSession(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function signOutDemoUser() {
  await authStorage.removeItem(DEMO_AUTH_KEY);
  emit(null);
}

export async function updateDemoProfile(updates: {
  displayName: string;
  handle: string;
  bio: string;
}) {
  const session = await getDemoSession();

  if (!session) {
    throw new Error("No demo session found.");
  }

  const normalizedHandle = normalizeUsername(updates.handle) || session.handle;

  const nextSession: DemoSession = {
    ...session,
    displayName: updates.displayName.trim() || session.displayName,
    handle: normalizedHandle,
    bio: updates.bio.trim() || session.bio,
  };

  await authStorage.setItem(DEMO_AUTH_KEY, JSON.stringify(nextSession));
  emit(nextSession);
  return nextSession;
}

export function onDemoAuthStateChange(listener: (session: DemoSession | null) => void) {
  listeners.add(listener);

  return {
    unsubscribe() {
      listeners.delete(listener);
    },
  };
}

function emit(session: DemoSession | null) {
  for (const listener of listeners) {
    listener(session);
  }
}

function normalizeDemoSession(value: unknown): DemoSession | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<DemoSession>;

  if (
    candidate.id !== "demo-user" ||
    typeof candidate.email !== "string" ||
    typeof candidate.displayName !== "string" ||
    typeof candidate.handle !== "string" ||
    typeof candidate.bio !== "string" ||
    typeof candidate.createdAt !== "string"
  ) {
    return null;
  }

  return {
    id: candidate.id,
    email: candidate.email,
    displayName: candidate.displayName,
    handle: candidate.handle,
    bio: candidate.bio,
    createdAt: candidate.createdAt,
    isDemo: true,
  };
}
