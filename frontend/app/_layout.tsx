import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import * as Notifications from "expo-notifications";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  useFonts,
  Merriweather_400Regular,
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
import { colors } from "@/lib/theme";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import {
  configureNotificationHandler,
  requestNotificationPermissions,
} from "@/lib/notifications";

// Show notification banners even when the app is in the foreground
configureNotificationHandler();

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
  const [loaded] = useFonts({
    Merriweather_400Regular,
    Merriweather_700Bold,
    Merriweather_400Regular_Italic,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.bg).catch(() => {});
  }, []);

  if (!loaded) return null;

  return (
    <AuthProvider>
      <AuthGate fontsLoaded={loaded} />
    </AuthProvider>
  );
}

function AuthGate({ fontsLoaded }: { fontsLoaded: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const { authReady, authError, isAuthenticated } = useAuth();

  // Request notification permissions on launch
  useEffect(() => {
    requestNotificationPermissions().catch(() => {});
  }, []);

  // Navigate to camera when user taps a notification
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as
        | { habitId?: string; screen?: string }
        | undefined;
      if (data?.screen === "camera" && data.habitId) {
        router.push(`/camera/${data.habitId}`);
      }
    });
    return () => sub.remove();
  }, [router]);

  useEffect(() => {
    if (fontsLoaded && authReady) SplashScreen.hideAsync().catch(() => {});
  }, [authReady, fontsLoaded]);

  useEffect(() => {
    if (!fontsLoaded || !authReady) return;

    const isPublicRoute = pathname === "/auth" || pathname.startsWith("/auth/");
    const isAuthEntryRoute =
      pathname === "/auth" ||
      pathname === "/auth/login" ||
      pathname === "/auth/signup" ||
      pathname === "/auth/check-email";

    if (!isAuthenticated && !isPublicRoute) {
      router.replace("/auth");
      return;
    }

    if (isAuthenticated && isAuthEntryRoute) {
      router.replace("/");
    }
  }, [authReady, fontsLoaded, isAuthenticated, pathname, router]);

  if (!authReady) return null;

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
            <Stack.Screen
              name="search-circles"
              options={{ gestureEnabled: true, fullScreenGestureEnabled: true }}
            />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="messages" />
            <Stack.Screen
              name="new-chat"
              options={{ presentation: "modal", animation: "slide_from_bottom" }}
            />
            <Stack.Screen name="chat/[id]" />
            <Stack.Screen
              name="edit-profile"
              options={{ presentation: "modal", animation: "slide_from_bottom" }}
            />
          </Stack>
        )}
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
