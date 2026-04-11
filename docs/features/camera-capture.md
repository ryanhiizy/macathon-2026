# Feature: Camera Capture

The in-app camera for capturing proof snaps. Two modes: solo and group. Camera roll access is structurally impossible by design.

## Hard Requirements

- **No camera roll.** Mount `<CameraView>` from `expo-camera` directly. `expo-image-picker` is forbidden.
- **Live capture only.** Photos must come from the device sensor in the current session.
- **Timestamped at capture.** Stamp `Date.now()` the moment `takePictureAsync` resolves. Read `exif.DateTimeOriginal` as a secondary signal.
- **30-minute window.** If past `habit_instance.window_closes_at`, show "window closed" state and block capture.

---

## Solo Camera (`capture/[habitId].tsx`)

### Flow

1. User taps "Prove" on an incomplete habit → deep link opens `capture/[habitId].tsx`
2. Screen fetches the current `habit_instance` and its prompt
3. Camera preview fills the screen; AI prompt card pinned to top
4. User taps shutter → `takePictureAsync({ exif: true, quality: 0.7 })`
5. Confirm modal: "Submit" or "Retake"
6. On submit: upload to Supabase Storage → call YOLO server (if verifiable) → write `snap` row

### UI Elements

- Habit name in header
- AI-generated solo prompt card (prominent, above the viewfinder)
- Deadline countdown
- Camera viewfinder (full screen)
- Controls: flip camera, shutter button, flash toggle

---

## Group Camera (`group-prove/[habitId].tsx`)

### Flow

1. User taps 👥 invite on a habit → selects friends in bottom sheet → taps "Start Group Prove"
2. Group camera opens with group-tailored AI prompt (different from the solo prompt)
3. Ready-status panel shows each participant: ready or waiting. Host is auto-marked ready.
4. User takes the photo
5. Confirm modal: "Submit" or "Retake"
6. On submit: upload photo → YOLO check (if verifiable) → write `snap` row with `is_group_post=true` → write `snap_participants` rows linked to each participant's `habit_instance` → streaks increment for all participants

### UI Elements

- "Group" badge in header
- Avatar stack + participant names below the header
- AI-generated group prompt card (contextually adapted for multiple people)
- Deadline + "Waiting for all participants" note
- Ready-status panel: each participant with status indicator (ready / waiting)
- Participant count badge overlaid on the viewfinder
- Controls: flip camera, shutter button, flash toggle

---

## Implementation Notes

- `expo-camera` is bundled in Expo Go SDK 54 — no dev build needed
- Unmount `<CameraView>` when the screen loses focus (only one preview at a time on iOS)
- Handle permission denial gracefully with a "grant camera permission" state
- Flash + haptic on capture
- Bottom tab bar is hidden in both camera screens — replaced by camera controls + back button

## Dependencies

```bash
npx expo install expo-camera expo-haptics expo-audio
```
