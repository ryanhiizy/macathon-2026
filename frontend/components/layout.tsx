import { ReactNode, useRef, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing } from "@/lib/theme";

type ScreenProps = {
  children: ReactNode;
  stickyHeader?: ReactNode;
  contentStyle?: ViewStyle;
  scroll?: boolean;
  edges?: ("top" | "bottom" | "left" | "right")[];
} & Pick<ScrollViewProps, "refreshControl" | "onScroll" | "scrollEventThrottle">;

export function Screen({
  children,
  stickyHeader,
  contentStyle,
  scroll = true,
  edges = ["top"],
  onScroll,
  scrollEventThrottle,
  ...rest
}: ScreenProps) {
  const [headerElevated, setHeaderElevated] = useState(false);
  const headerElevatedRef = useRef(false);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextHeaderElevated = event.nativeEvent.contentOffset.y > spacing.xs;

    if (nextHeaderElevated !== headerElevatedRef.current) {
      headerElevatedRef.current = nextHeaderElevated;
      setHeaderElevated(nextHeaderElevated);
    }

    onScroll?.(event);
  };

  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.scroll, contentStyle]}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
      onScroll={handleScroll}
      scrollEventThrottle={scrollEventThrottle ?? 16}
      {...rest}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.fill, contentStyle]}>{children}</View>
  );
  return (
    <SafeAreaView edges={edges} style={styles.screen}>
      {stickyHeader && (
        <View
          style={[styles.stickyHeader, headerElevated && styles.stickyHeaderElevated]}
        >
          {stickyHeader}
          {headerElevated && (
            <LinearGradient
              pointerEvents="none"
              colors={[`${colors.black}1f`, `${colors.black}00`]}
              style={styles.stickyHeaderShadow}
            />
          )}
        </View>
      )}
      {body}
    </SafeAreaView>
  );
}

export function Row({
  style,
  children,
  gap = spacing.sm,
  ...rest
}: ViewProps & { gap?: number }) {
  return (
    <View
      {...rest}
      style={[{ flexDirection: "row", alignItems: "center", gap }, style]}
    >
      {children}
    </View>
  );
}

export function Card({ style, children, ...rest }: ViewProps) {
  return (
    <View {...rest} style={[styles.card, style]}>
      {children}
    </View>
  );
}

export function Stack({
  style,
  children,
  gap = spacing.md,
  ...rest
}: ViewProps & { gap?: number }) {
  return (
    <View {...rest} style={[{ gap }, style]}>
      {children}
    </View>
  );
}

export function Divider({
  style,
  inset = 0,
  strong,
}: {
  style?: ViewStyle;
  inset?: number;
  strong?: boolean;
}) {
  return (
    <View
      style={[
        {
          height: StyleSheet.hairlineWidth * 2,
          backgroundColor: strong ? colors.borderStrong : colors.border,
          marginHorizontal: inset,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  stickyHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: colors.bg,
    zIndex: 1,
    position: "relative",
  },
  stickyHeaderElevated: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: `${colors.black}18`,
  },
  stickyHeaderShadow: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -10,
    height: 10,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 120,
    gap: spacing.xl,
  },
  fill: { flex: 1 },
});
