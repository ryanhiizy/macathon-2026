import { Text, StyleSheet, type TextProps, type TextStyle } from "react-native";
import { type, colors } from "@/lib/theme";

type Variant = "display" | "h1" | "h2" | "h3" | "eyebrow" | "body" | "bodyMuted" | "label" | "caption";

type Props = TextProps & {
  variant?: Variant;
  color?: TextStyle["color"];
};

const variantStyle: Record<Variant, TextStyle> = {
  display: type.display,
  h1: type.h1,
  h2: type.h2,
  h3: type.h3,
  eyebrow: { ...type.eyebrow, textTransform: "uppercase" },
  body: type.body,
  bodyMuted: type.bodyMuted,
  label: type.label,
  caption: type.caption,
};

export function Typography({ variant = "body", color, style, ...rest }: Props) {
  const base = variantStyle[variant];
  const flat = StyleSheet.flatten(style) as TextStyle | undefined;
  // If caller overrides fontSize without lineHeight, autoscale to prevent tall
  // fonts like Merriweather from being clipped by the variant's default lineHeight.
  const overrideSize = flat?.fontSize;
  const autoLineHeight =
    overrideSize != null && overrideSize !== base.fontSize && flat?.lineHeight == null
      ? Math.round(overrideSize * 1.4)
      : undefined;
  return (
    <Text
      {...rest}
      style={[
        base,
        color != null && { color },
        style,
        autoLineHeight != null && { lineHeight: autoLineHeight },
      ]}
    />
  );
}

export const Heading = (props: Omit<Props, "variant"> & { level?: 1 | 2 | 3 }) => (
  <Typography variant={`h${props.level ?? 1}` as Variant} {...props} />
);

export const Body = (props: Omit<Props, "variant">) => <Typography variant="body" {...props} />;
export const Muted = (props: Omit<Props, "variant">) => <Typography variant="bodyMuted" {...props} />;
export const Eyebrow = (props: Omit<Props, "variant">) => <Typography variant="eyebrow" color={colors.primary} {...props} />;
export const Caption = (props: Omit<Props, "variant">) => <Typography variant="caption" {...props} />;
