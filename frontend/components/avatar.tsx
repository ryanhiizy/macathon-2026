import { View, type ViewStyle } from "react-native";
import { Image } from "expo-image";
import { Typography } from "@/components/typography";
import { colors, fonts, radius } from "@/lib/theme";
import { pickPhoto } from "@/lib/mock";

type Props = {
  color: string;
  letter: string;
  size?: number;
  ringColor?: string;
  ring?: boolean;
  photoIndex?: number;
  style?: ViewStyle;
};

export function Avatar({
  color,
  letter,
  size = 36,
  ringColor,
  ring = true,
  photoIndex,
  style,
}: Props) {
  const content =
    photoIndex != null ? (
      <Image
        source={pickPhoto(photoIndex)}
        style={{ width: size, height: size, borderRadius: radius.pill }}
      />
    ) : (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: radius.pill,
          backgroundColor: color,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          color={colors.onPrimary}
          style={{
            fontFamily: fonts.heading,
            fontSize: size * 0.42,
            lineHeight: size * 0.52,
          }}
        >
          {letter}
        </Typography>
      </View>
    );
  return (
    <View
      style={[
        {
          width: size + (ring ? 4 : 0),
          height: size + (ring ? 4 : 0),
          borderRadius: radius.pill,
          borderWidth: ring ? 2 : 0,
          borderColor: ringColor ?? colors.bg,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      {content}
    </View>
  );
}

export function AvatarStack({
  avatars,
  size = 32,
}: {
  avatars: { color: string; letter: string; photoIndex?: number }[];
  size?: number;
}) {
  const overlap = size * 0.38;
  return (
    <View style={{ flexDirection: "row" }}>
      {avatars.map((a, i) => (
        <View key={i} style={{ marginLeft: i === 0 ? 0 : -overlap, zIndex: avatars.length - i }}>
          <Avatar {...a} size={size} />
        </View>
      ))}
    </View>
  );
}
