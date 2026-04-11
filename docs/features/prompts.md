# Feature: AI Prompts

Each habit instance gets an AI-generated prompt that tells the user what to photograph. Prompts are the core differentiator — they make the verification photo fun, unpredictable, and feed-worthy.

## Two Prompt Types

### Solo Prompts
Generated for a single user proving a habit alone. Tailored to the specific habit and designed for one person.

Examples:
- Running: *"Throw a peace sign mid-stride!"*
- Gym: *"Flex with a dumbbell and point at the camera"*
- Water: *"Show your water bottle — how full is it?"*

### Group Prompts
Generated when a Group Prove session starts. Contextually adapted for multiple people — meaningfully different from the solo prompt for the same habit.

Examples (same habits, group version):
- Running: *"Everyone jump in the air at the same time!"*
- Gym: *"All flex your biceps together!"*
- Water: *"Cheers! Clink your water bottles together!"*

## Where Prompts Live

### Primary: AI Generation (FastAPI server)
The demo laptop's FastAPI server exposes a `/generate-prompt` endpoint that calls the Claude/OpenAI API.

```
POST /generate-prompt
{
  "category": "running",
  "mode": "solo" | "group",
  "participant_count": 1 | N
}

→ {
  "prompt_text": "Throw a peace sign mid-stride!",
  "required_classes": ["person"],
  "id": "generated_<uuid>"
}
```

The app calls this when the habit instance is created (at notification fire time, or lazily on first open of the camera screen).

### Fallback: Static JSON Bank
`app/constants/prompts.json` — used if the AI server is unreachable or slow. Same shape as the generated prompt.

```ts
type Prompt = {
  id: string;
  category: Category;
  mode: 'solo' | 'group';
  text: string;
  requiredClasses: {
    class: string;
    minConfidence: number;
  }[];
};
```

```ts
function pickFallbackPrompt(category: Category, mode: 'solo' | 'group'): Prompt {
  const pool = prompts.filter(p => p.category === category && p.mode === mode);
  return pool[Math.floor(Math.random() * pool.length)];
}
```

## Display

- Shown prominently on the camera screen above the viewfinder before the photo is taken
- The exact prompt text is stored on the `habit_instance` row and on the `snap` row
- The prompt appears on the feed post card so viewers have context for the photo
- Prompts should vary daily — AI generation handles this naturally; the static bank should have enough variety per category

## Storage

`habit_instance.prompt_text` — the actual text shown to the user. Fixed for that instance's lifetime once assigned.
