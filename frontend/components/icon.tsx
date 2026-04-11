import { HugeiconsIcon, type HugeiconsProps } from "@hugeicons/react-native";
import { colors } from "@/lib/theme";

type Props = Omit<HugeiconsProps, "color" | "size"> & {
  size?: number;
  color?: string;
};

export function Icon({ size = 24, color = colors.fg, strokeWidth = 1.75, ...rest }: Props) {
  return <HugeiconsIcon size={size} color={color} strokeWidth={strokeWidth} {...rest} />;
}
