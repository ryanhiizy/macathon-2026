# Feature: Random Funny Prompts

Each habit instance gets a randomly assigned silly prompt that tells the user exactly what to photograph. Prompts are the core differentiator of this app — they make cheating with a pre-taken photo much harder and make the feed fun to scroll.

## What it does

When a habit instance is created (at fire time, or lazily on first open), the app picks a random prompt from the bank for that habit's category. The prompt is stored on the `habit_instance` row and remains fixed for that instance's lifetime.

## Prompt shape

```ts
type Prompt = {
  id: string;            // stable id, e.g. "running_banana_phone"
  category: Category;    // which habits can draw this prompt
  text: string;          // user-facing instruction
  requiredClasses: {     // YOLO classes that must be detected
    class: string;
    minConfidence: number;
  }[];
  optionalClasses?: {    // bonus detections, earn a badge
    class: string;
    minConfidence: number;
  }[];
};
```

## Storage

**Static JSON** at `app/constants/prompts.json` in V1. No database table, no LLM. This is intentional — keeps verification deterministic and the bank reviewable in PRs.

Example:

```json
[
  {
    "id": "running_banana_phone",
    "category": "running",
    "text": "Take a selfie holding a banana like it's a phone",
    "requiredClasses": [
      { "class": "person", "minConfidence": 0.6 },
      { "class": "banana", "minConfidence": 0.5 }
    ]
  },
  {
    "id": "gym_dumbbell_flex",
    "category": "gym",
    "text": "Flex with a dumbbell and point at the camera",
    "requiredClasses": [
      { "class": "person", "minConfidence": 0.6 }
    ]
  }
]
```

## Selection logic

```ts
function pickPrompt(category: Category): Prompt {
  const pool = prompts.filter(p => p.category === category);
  return pool[Math.floor(Math.random() * pool.length)];
}
```
