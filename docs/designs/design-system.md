# Design System

Reference palette and tokens. Use these so the app looks intentional — not a strict contract.

## Colours

```ts
// constants/colors.ts
export const colors = {
  bg:          '#0A0A0B',  // app background
  bgSubtle:    '#141416',  // cards, surfaces
  bgElevated:  '#1C1C20',  // modals, bottom sheets

  text:        '#F5F5F7',  // primary text
  textSubtle:  '#9A9AA3',  // timestamps, secondary info

  accent:      '#FF4D6D',  // brand — punchy pink for a social app
  accentFg:    '#FFFFFF',

  success:     '#4ADE80',  // verified, streak continues
  danger:      '#F43F5E',  // missed, streak broken
  warning:     '#FBBF24',  // window closing soon

  border:      '#2A2A2F',
} as const;
```

## Typography

```ts
// Three sizes, use them consistently
export const typography = {
  display: { fontSize: 32, fontWeight: '700' as const },
  body:    { fontSize: 16, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
} as const;
```

## Spacing

Multiples of 4. Use `p-4` (16px) for screen padding, `gap-3` (12px) between items, `gap-6` (24px) between sections.

## What to build (in order)

Don't pre-build a component library. Build components when you need them:

1. Camera screen (the core demo moment)
2. Circle feed
3. Habit creation form
4. Streak display
5. Everything else
