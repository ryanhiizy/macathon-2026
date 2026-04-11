import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { type Session, type User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
  getDemoSession,
  onDemoAuthStateChange,
  signOutDemoUser,
  type DemoSession,
} from "@/lib/demo-auth";

type AuthState = {
  session: Session | null;
  user: User | null;
  demoSession: DemoSession | null;
  isAuthenticated: boolean;
  authReady: boolean;
  authError: string | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [demoSession, setDemoSession] = useState<DemoSession | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    Promise.all([supabase.auth.getSession(), getDemoSession()])
      .then(([supabaseResult, storedDemoSession]) => {
        if (!isActive) return;

        if (supabaseResult.error) {
          setAuthError(supabaseResult.error.message);
        } else {
          setSession(supabaseResult.data.session);
        }

        setDemoSession(storedDemoSession);
        setAuthReady(true);
      })
      .catch((error: unknown) => {
        if (!isActive) return;
        setAuthError(
          error instanceof Error ? error.message : "Failed to read the current auth session.",
        );
        setAuthReady(true);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isActive) return;
      setSession(nextSession);
      if (nextSession) {
        signOutDemoUser().catch(() => {});
      }
      setAuthReady(true);
    });

    const demoSubscription = onDemoAuthStateChange((nextDemoSession) => {
      if (!isActive) return;
      setDemoSession(nextDemoSession);
      setAuthReady(true);
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
      demoSubscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    if (demoSession) {
      await signOutDemoUser();
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      setAuthError(error.message);
    }
  };

  const user = session?.user ?? null;
  const isAuthenticated = Boolean(session || demoSession);

  return (
    <AuthContext.Provider
      value={{ session, user, demoSession, isAuthenticated, authReady, authError, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
