# Feature: Camera Capture

The in-app camera that captures proof snaps. This is the most technically constrained feature because of the "no camera roll" requirement.

## What it does

1. User taps a notification → deep link opens `app/capture/[habitId].tsx`
2. Screen fetches the current `habit_instance` and its prompt
3. Camera preview fills the screen; prompt card pinned to top
4. User taps the capture button → `takePictureAsync({ exif: true, quality: 0.7 })`
5. Photo is shown in a confirm modal with "Submit" and "Retake"
6. On submit: upload to Supabase Storage → call YOLO server → write `snap` row

## Hard requirements

- **No camera roll.** We mount `<CameraView>` from `expo-camera` directly. `expo-image-picker` is forbidden (see [`../principles.md`](../principles.md)).
- **Live capture only.** Photos must come from the device sensor in the current session.
- **Timestamped at capture.** We stamp `Date.now()` the moment `takePictureAsync` resolves. We also read `exif.DateTimeOriginal` as a secondary signal.
- **30-minute window.** If the current time is past `habit_instance.window_closes_at`, the screen shows a "window closed" state and blocks capture.

## Implementation notes

- `expo-camera` is bundled in Expo Go SDK 54 — no dev build needed
- Unmount `<CameraView>` when the screen loses focus (only one preview at a time on iOS)
- Handle permission denial gracefully with a "grant camera permission" state
- Flash and haptic on capture (see [`../designs/frontend-rules.md`](../designs/frontend-rules.md))

## Dependencies

```bash
npx expo install expo-camera expo-haptics expo-audio
```
