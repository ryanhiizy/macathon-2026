import { useState, type ReactNode } from "react";
import {
  ScrollView,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { colors, fonts, radius, spacing } from "@/lib/theme";
import { Typography } from "@/components/typography";
import { pickPhoto } from "@/lib/mock";
import type { ImageSource } from "expo-image";

type Props = {
  photoIdxs?: number[];
  photos?: ImageSource[];
  overlay?: ReactNode;
};

export function PhotoCarousel({ photoIdxs, photos, overlay }: Props) {
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width === 0) return;
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== active) setActive(i);
  };

  const sources: ImageSource[] = photos ?? (photoIdxs ?? [0]).map((i) => pickPhoto(i));
  const multi = sources.length > 1;

  const dots = multi ? (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      {sources.map((_, i) => (
        <View
          key={i}
          style={{
            width: i === active ? 18 : 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: i === active ? colors.bg : colors.bg + "80",
          }}
        />
      ))}
    </View>
  ) : null;

  const bottomOverlay = overlay ? (
    <View style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
      <MaskedView
        style={{ height: 90 }}
        maskElement={
          <LinearGradient
            colors={["transparent", "black"]}
            style={{ flex: 1 }}
          />
        }
      >
        <BlurView intensity={50} tint="dark" style={{ flex: 1 }} />
      </MaskedView>
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.md,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {overlay}
        {dots}
      </View>
    </View>
  ) : null;

  if (sources.length <= 1) {
    return (
      <View
        style={{
          borderRadius: radius.lg,
          overflow: "hidden",
          backgroundColor: colors.bgSunk,
        }}
      >
        <Image
          source={sources[0]}
          style={{ width: "100%", aspectRatio: 1 }}
          contentFit="cover"
          transition={240}
        />
        {bottomOverlay}
      </View>
    );
  }

  return (
    <View style={{ position: "relative" }}>
      <View
        onLayout={onLayout}
        style={{
          borderRadius: radius.lg,
          overflow: "hidden",
          backgroundColor: colors.bgSunk,
        }}
      >
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
        >
          {sources.map((src, i) => (
            <Image
              key={i}
              source={src}
              style={{ width, aspectRatio: 1 }}
              contentFit="cover"
              transition={240}
            />
          ))}
        </ScrollView>
        {bottomOverlay}
      </View>
      <View
        style={{
          position: "absolute",
          top: spacing.md,
          right: spacing.md,
          paddingHorizontal: spacing.sm,
          paddingVertical: 3,
          borderRadius: radius.pill,
          backgroundColor: colors.black + "aa",
        }}
      >
        <Typography
          color={colors.bg}
          style={{ fontFamily: fonts.bodyBold, fontSize: 11, lineHeight: 14 }}
        >
          {active + 1} / {sources.length}
        </Typography>
      </View>
    </View>
  );
}
