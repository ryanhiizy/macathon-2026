import { useState, type ReactNode } from "react";
import {
  ScrollView,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { Image, type ImageSource } from "expo-image";
import { Typography } from "@/components/typography";
import { pickPhoto } from "@/lib/mock";
import { colors, fonts, radius, spacing } from "@/lib/theme";

type Props = {
  photoIdxs?: number[];
  photos?: ImageSource[];
  footer?: ReactNode;
};

export function PhotoCarousel({ photoIdxs, photos, footer }: Props) {
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState(0);

  const onLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width === 0) return;
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    if (nextIndex !== active) {
      setActive(nextIndex);
    }
  };

  const sources: ImageSource[] = photos ?? (photoIdxs ?? [0]).map((index) => pickPhoto(index));
  const isMulti = sources.length > 1;

  const dots = isMulti ? (
    <View style={{ position: "absolute", left: 0, right: 0, bottom: spacing.md, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6 }}>
      {sources.map((_, index) => (
        <View
          key={index}
          style={{
            width: index === active ? 18 : 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: index === active ? colors.bg : `${colors.bg}80`,
          }}
        />
      ))}
    </View>
  ) : null;

  if (sources.length <= 1) {
    return (
      <View>
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
        </View>
        {footer}
      </View>
    );
  }

  return (
    <View>
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
            {sources.map((source, index) => (
              <Image
                key={index}
                source={source}
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
            backgroundColor: `${colors.black}aa`,
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
      {footer}
    </View>
  );
}
