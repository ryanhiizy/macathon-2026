import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  useFonts,
  Merriweather_400Regular_Italic,
  Merriweather_700Bold,
} from "@expo-google-fonts/merriweather";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { Text, View } from "react-native";
import { type Session } from "@supabase/supabase-js";
import { colors } from "@/lib/theme";
import { supabase } from "@/lib/supabase";
import {
  getDemoSession,
  onDemoAuthStateChange,
  signOutDemoUser,
  type DemoSession,
} from "@/lib/demo-auth";

SplashScreen.preventAutoHideAsync().catch(() => {});

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.bg,
    card: colors.bg,
    text: colors.fg,
    border: "transparent",
    notification: colors.primary,
  },
};

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const [loaded] = useFonts({
    Merriweather_700Bold,
    Merriweather_400Regular_Italic,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
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

  useEffect(() => {
    if (loaded && authReady) SplashScreen.hideAsync().catch(() => {});
  }, [authReady, loaded]);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.bg).catch(() => {});
  }, []);

  useEffect(() => {
    if (!loaded || !authReady) return;

    const isPublicRoute = pathname === "/auth" || pathname.startsWith("/auth/");
    const isAuthEntryRoute =
      pathname === "/auth" ||
      pathname === "/auth/login" ||
      pathname === "/auth/signup" ||
      pathname === "/auth/check-email";
    const isAuthenticated = Boolean(session || demoSession);

    if (!isAuthenticated && !isPublicRoute) {
      router.replace("/auth");
      return;
    }

    if (isAuthenticated && isAuthEntryRoute) {
      router.replace("/");
    }
  }, [authReady, demoSession, loaded, pathname, router, session]);

  if (!loaded || !authReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ThemeProvider value={navigationTheme}>
        <StatusBar style="dark" />
        {authError ? (
          <View
            style={{
              flex: 1,
              backgroundColor: colors.bg,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 24,
            }}
          >
            <Text style={{ color: colors.fg, fontSize: 18, textAlign: "center" }}>{authError}</Text>
          </View>
        ) : (
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg },
              animation: "slide_from_right",
            }}
          >
            <Stack.Screen name="auth/index" />
            <Stack.Screen name="auth/login" />
            <Stack.Screen name="auth/signup" />
            <Stack.Screen name="auth/check-email" />
            <Stack.Screen name="auth/callback" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="create-habit"
              options={{ presentation: "modal", animation: "slide_from_bottom" }}
            />
            <Stack.Screen
              name="create-circle"
              options={{ presentation: "modal", animation: "slide_from_bottom" }}
            />
            <Stack.Screen
              name="camera/[id]"
              options={{
                animation: "slide_from_bottom",
                animationDuration: 260,
              }}
            />
            <Stack.Screen
              name="group-camera/[id]"
              options={{
                animation: "slide_from_bottom",
                animationDuration: 260,
              }}
            />
            <Stack.Screen
              name="invite/[id]"
              options={{ presentation: "modal", animation: "slide_from_bottom" }}
            />
            <Stack.Screen name="circle/[id]" />
            <Stack.Screen name="habit/[id]" />
          </Stack>
        )}
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
