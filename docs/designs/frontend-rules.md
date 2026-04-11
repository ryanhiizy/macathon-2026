# Frontend Guidelines

Guidelines for UI work. Use judgement — this is a hackathon, not a design review.

## Styling

- **NativeWind** for everything — utility classes via `className` on RN components
- If NativeWind can't express something, `StyleSheet.create` is fine
- Dark background, light text — the app lives in the camera screen, keep chrome dark

## Components

- **`Ionicons`** from `@expo/vector-icons` for icons — already installed
- **`expo-image`** instead of RN `<Image>` for snaps in the feed (handles caching)
- **`expo-haptics`** on the shutter button and verification result — adds a lot of feel for minimal effort
- Wrap every screen in `<SafeAreaView>` from `react-native-safe-area-context`

## The camera screen

This is the centrepiece of the demo. Get this right before polishing anything else:
- Full-bleed `<CameraView>` — no padding, no chrome
- Prompt text pinned to the top, floating over the camera
- Capture button centred at the bottom

## Hard rules

- ❌ **Never `expo-image-picker`** — camera roll access breaks the proof mechanic
- ❌ **Never `alert()`** — use a simple `Text` error state or a basic toast
- ❌ **Never commit hex colours as magic strings** — put them in `constants/colors.ts` so the demo looks consistent

## Colours

See [`design-system.md`](design-system.md) for the palette. Use it as a reference, not a strict contract — if you need to hardcode a hex to move fast, do it and clean it up later.
