from __future__ import annotations

import json
import random
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

import httpx
from openai import OpenAI

from backend.config import Settings


@dataclass(frozen=True)
class HabitStats:
    habit_name: str
    category: str
    total_instances: int
    verified_count: int
    missed_count: int
    completion_rate: float
    current_streak: int
    best_streak: int
    avg_completion_hour: float | None
    best_day_of_week: str | None
    worst_day_of_week: str | None
    group_prove_count: int
    solo_prove_count: int
    days_since_creation: int
    has_enough_data: bool


@dataclass(frozen=True)
class CoachInsight:
    headline: str
    detail: str
    habit_name: str
    insight_type: str


FALLBACK_INSIGHTS = [
    CoachInsight(
        headline="Don't break the chain — you're past the hard part",
        detail="Most people quit a new habit by day 2. You're still here, which means the initial resistance is behind you. Keep showing up and it gets easier.",
        habit_name="",
        insight_type="streak_momentum",
    ),
    CoachInsight(
        headline="Invite someone for your next session",
        detail="Social accountability is the strongest predictor of habit consistency. One Group Prove this week could lock in the rest of the month.",
        habit_name="",
        insight_type="social_boost",
    ),
    CoachInsight(
        headline="Make tomorrow's session effortless",
        detail="Reduce friction tonight: set out what you need, pick the time, remove the decision. The less you have to think, the more likely you'll do it.",
        habit_name="",
        insight_type="risk_alert",
    ),
]

DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def _supabase_get(settings: Settings, table: str, params: dict) -> list[dict]:
    """Hit Supabase PostgREST directly with the service role key."""
    url = f"{settings.supabase_url}/rest/v1/{table}"
    headers = {
        "apikey": settings.supabase_service_key or "",
        "Authorization": f"Bearer {settings.supabase_service_key}",
    }
    resp = httpx.get(url, params=params, headers=headers, timeout=10)
    resp.raise_for_status()
    return resp.json()


def compute_habit_stats(settings: Settings, user_id: str, habit_id: str) -> HabitStats:
    """Query Supabase and compute analytics for one habit."""

    # 1. Habit metadata
    habits = _supabase_get(settings, "habits", {
        "select": "name,category,circle_id,created_at",
        "id": f"eq.{habit_id}",
        "user_id": f"eq.{user_id}",
    })
    if not habits:
        raise ValueError("Habit not found")
    habit = habits[0]
    habit_name = habit["name"]
    category = habit["category"]
    circle_id = habit["circle_id"]
    created_at = datetime.fromisoformat(habit["created_at"].replace("Z", "+00:00"))
    days_since = (datetime.now(timezone.utc) - created_at).days

    # 2. Habit instances (last 30 days)
    cutoff = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
    instances = _supabase_get(settings, "habit_instances", {
        "select": "id,status,scheduled_for,verified_at",
        "habit_id": f"eq.{habit_id}",
        "scheduled_for": f"gte.{cutoff}",
    })
    total = len(instances)
    verified = [i for i in instances if i["status"] == "verified"]
    missed = [i for i in instances if i["status"] == "missed"]
    rate = len(verified) / total if total > 0 else 0.0

    # 3. Snaps for timing + group/solo analysis
    instance_ids = [i["id"] for i in instances]
    snaps = []
    if instance_ids:
        # Query in batches if needed, but for MVP just get all user snaps in range
        snaps = _supabase_get(settings, "snaps", {
            "select": "created_at,is_group_post",
            "user_id": f"eq.{user_id}",
            "created_at": f"gte.{cutoff}",
        })

    # Completion hour analysis
    avg_hour = None
    best_day = None
    worst_day = None
    if snaps:
        hours = []
        day_counts: dict[int, int] = {i: 0 for i in range(7)}
        day_totals: dict[int, int] = {i: 0 for i in range(7)}
        for s in snaps:
            dt = datetime.fromisoformat(s["created_at"].replace("Z", "+00:00"))
            hours.append(dt.hour + dt.minute / 60)
            day_counts[dt.weekday()] += 1
        for i in instances:
            dt = datetime.fromisoformat(i["scheduled_for"].replace("Z", "+00:00"))
            day_totals[dt.weekday()] += 1

        if hours:
            avg_hour = sum(hours) / len(hours)

        day_rates = {}
        for d in range(7):
            if day_totals[d] > 0:
                day_rates[d] = day_counts[d] / day_totals[d]
        if day_rates:
            best_day = DAY_NAMES[max(day_rates, key=day_rates.get)]  # type: ignore[arg-type]
            worst_day = DAY_NAMES[min(day_rates, key=day_rates.get)]  # type: ignore[arg-type]

    group_count = sum(1 for s in snaps if s.get("is_group_post"))
    solo_count = len(snaps) - group_count

    # 4. Streak from circle_members
    members = _supabase_get(settings, "circle_members", {
        "select": "current_streak,best_streak",
        "circle_id": f"eq.{circle_id}",
        "user_id": f"eq.{user_id}",
    })
    current_streak = members[0]["current_streak"] if members else 0
    best_streak = members[0]["best_streak"] if members else 0

    return HabitStats(
        habit_name=habit_name,
        category=category,
        total_instances=total,
        verified_count=len(verified),
        missed_count=len(missed),
        completion_rate=round(rate, 2),
        current_streak=current_streak,
        best_streak=best_streak,
        avg_completion_hour=round(avg_hour, 1) if avg_hour is not None else None,
        best_day_of_week=best_day,
        worst_day_of_week=worst_day,
        group_prove_count=group_count,
        solo_prove_count=solo_count,
        days_since_creation=days_since,
        has_enough_data=len(verified) >= 5,
    )


COACH_SYSTEM_PROMPT = """\
You are a personal habit coach inside an app called "presence". You look at a user's data and give them ONE piece of real, actionable coaching advice — like a friend who also happens to be a behavioral psychologist.

You are NOT a stats dashboard. Don't just restate numbers. Instead:
- Tell them what to DO differently based on the pattern you see
- Explain WHY it matters using behavioral science (habit stacking, implementation intentions, the 66-day rule, social accountability, friction reduction)
- Give them a specific tactic they can use TODAY

Rules:
- Return JSON with exactly these keys: headline, detail, insight_type
- headline: a direct, action-oriented sentence (max 12 words). Talk TO the user, not about them. e.g. "Lay out your shoes tonight" not "You tend to miss mornings"
- detail: 1-2 sentences explaining the reasoning and giving a concrete next step. Use a specific number from their data to make it credible, but lead with the advice, not the stat.
- insight_type: one of "optimal_timing", "streak_momentum", "risk_alert", "social_boost", "recovery", "cross_habit", "general"
- Be warm and direct, like a coach who knows them well. Never preachy or generic.
- Pick the insight that would be most USEFUL right now, not the most impressive stat.

Examples of GOOD coaching (what to generate):
- "Protect your streak this Friday" / "You've broken 2 of your last 3 streaks on a Friday. Set a 6:45am alarm tonight as insurance — removing the decision makes it automatic."
- "Try a 5-minute version on weekends" / "You miss Saturdays because your routine changes. Consistency beats duration — a short session keeps the chain alive."
- "Stack this right after your morning walk" / "You never miss water on days you walk. Anchor it: glass of water the moment you're back, every time."

Examples of BAD coaching (don't do this):
- "Your completion rate is 85%" — that's a stat, not advice
- "Great job on your streak!" — that's cheerleading, not coaching
- "You complete more on weekdays" — that's an observation, not actionable
"""


def _build_stats_message(stats: HabitStats) -> str:
    lines = [
        f'Habit: "{stats.habit_name}" ({stats.category})',
        f"Completion rate (last 30d): {stats.completion_rate * 100:.0f}%",
        f"Verified: {stats.verified_count}/{stats.total_instances} instances",
        f"Current streak: {stats.current_streak} days",
        f"Longest streak: {stats.best_streak} days",
    ]
    if stats.avg_completion_hour is not None:
        hour = int(stats.avg_completion_hour)
        ampm = "AM" if hour < 12 else "PM"
        display_hour = hour % 12 or 12
        lines.append(f"Average completion time: {display_hour}:00 {ampm}")
    if stats.best_day_of_week:
        lines.append(f"Best day: {stats.best_day_of_week}")
    if stats.worst_day_of_week:
        lines.append(f"Worst day: {stats.worst_day_of_week}")
    if stats.group_prove_count + stats.solo_prove_count > 0:
        lines.append(f"Group proves: {stats.group_prove_count}, Solo proves: {stats.solo_prove_count}")
    lines.append(f"Days since habit created: {stats.days_since_creation}")
    return "\n".join(lines)


def generate_insight(settings: Settings, stats: HabitStats) -> CoachInsight:
    """Generate a coaching insight using GPT, with fallback."""
    if not stats.has_enough_data:
        fallback = random.choice(FALLBACK_INSIGHTS)
        return CoachInsight(
            headline=fallback.headline,
            detail=fallback.detail,
            habit_name=stats.habit_name,
            insight_type=fallback.insight_type,
        )

    provider = settings.prompt_provider
    if provider == "none":
        fallback = random.choice(FALLBACK_INSIGHTS)
        return CoachInsight(
            headline=fallback.headline,
            detail=fallback.detail,
            habit_name=stats.habit_name,
            insight_type=fallback.insight_type,
        )

    stats_message = _build_stats_message(stats)

    try:
        if provider == "openai":
            client = OpenAI(api_key=settings.openai_api_key)
            response = client.chat.completions.create(
                model=settings.openai_model,
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": COACH_SYSTEM_PROMPT},
                    {"role": "user", "content": stats_message},
                ],
            )
            content = response.choices[0].message.content or "{}"
        else:
            from anthropic import Anthropic

            client = Anthropic(api_key=settings.anthropic_api_key)
            response = client.messages.create(
                model=settings.anthropic_model,
                max_tokens=200,
                system=COACH_SYSTEM_PROMPT,
                messages=[{"role": "user", "content": stats_message}],
            )
            text_blocks = [block.text for block in response.content if getattr(block, "type", "") == "text"]
            content = "\n".join(text_blocks)

        data = json.loads(content)
        return CoachInsight(
            headline=data.get("headline", "Keep going!"),
            detail=data.get("detail", "You're making progress."),
            habit_name=stats.habit_name,
            insight_type=data.get("insight_type", "general"),
        )
    except Exception:
        fallback = random.choice(FALLBACK_INSIGHTS)
        return CoachInsight(
            headline=fallback.headline,
            detail=fallback.detail,
            habit_name=stats.habit_name,
            insight_type=fallback.insight_type,
        )
