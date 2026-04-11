import { useState, type ReactNode } from "react";
import {
  ScrollView,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { Image } from "expo-image";
import { colors, fonts, radius, spacing } from "@/lib/theme";
import { Typography } from "@/components/typography";
import { pickPhoto } from "@/lib/mock";

type Props = {
  photoIdxs: number[];
  footer?: ReactNode;
};

export function PhotoCarousel({ photoIdxs, footer }: Props) {
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width === 0) return;
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== active) setActive(i);
  };

  const multi = photoIdxs.length > 1;

  const dots = multi ? (
    <View
      style={{
        position: "absolute",
        bottom: spacing.sm,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 6,
      }}
    >
      {photoIdxs.map((_, i) => (
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

  if (photoIdxs.length === 1) {
    return (
      <View>
        <View
          style={{
            borderRadius: radius.md,
            overflow: "hidden",
            backgroundColor: colors.bgSunk,
          }}
        >
          <Image
            source={pickPhoto(photoIdxs[0])}
            style={{ width: "100%", aspectRatio: 1 }}
            contentFit="cover"
            transition={240}
          />
        </View>
        {footer}
      </View>
    );
  }

  return (
    <View>
      <View
        style={{ position: "relative" }}
        onLayout={onLayout}
      >
        <View
          style={{
            borderRadius: radius.md,
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
            {photoIdxs.map((idx, i) => (
              <Image
                key={i}
                source={pickPhoto(idx)}
                style={{ width, aspectRatio: 1 }}
                contentFit="cover"
                transition={240}
              />
            ))}
          </ScrollView>
          {dots}
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
            {active + 1} / {photoIdxs.length}
          </Typography>
        </View>
      </View>
      {footer}
    </View>
  );
}
