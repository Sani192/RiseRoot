import type { FeatureBoundary, ISODateString } from "@/types";

export type DailyPlanTimeOfDay = "morning" | "midday" | "afternoon" | "evening";

export interface DailyPlanTask {
  id: string;
  title: string;
  timeOfDay: DailyPlanTimeOfDay;
  description: string;
  durationMinutes: number;
}

export interface DailyPlan {
  date: ISODateString;
  weekday: WeekdayName;
  focus: string;
  affirmation: string;
  tasks: DailyPlanTask[];
}

type WeekdayName =
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

type WeekdayTemplate = Omit<DailyPlan, "date" | "weekday">;

const weekdayNames: WeekdayName[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const weekdayTemplates: Record<WeekdayName, WeekdayTemplate> = {
  Sunday: {
    focus: "Reflect, reset, and prepare gently for the week ahead.",
    affirmation: "I can prepare without rushing myself.",
    tasks: [
      {
        id: "sunday-weekly-review",
        title: "Weekly review",
        timeOfDay: "morning",
        description: "Name one win, one lesson, and one thing to release.",
        durationMinutes: 15,
      },
      {
        id: "sunday-plan-top-three",
        title: "Choose top three priorities",
        timeOfDay: "afternoon",
        description:
          "Pick the three commitments that would make the week feel grounded.",
        durationMinutes: 10,
      },
      {
        id: "sunday-evening-wind-down",
        title: "Evening wind-down",
        timeOfDay: "evening",
        description:
          "Set out tomorrow's essentials and step away from screens early.",
        durationMinutes: 20,
      },
    ],
  },
  Monday: {
    focus: "Start small, clarify priorities, and build momentum.",
    affirmation: "One clear next step is enough to begin.",
    tasks: [
      {
        id: "monday-priority-map",
        title: "Map the day",
        timeOfDay: "morning",
        description:
          "Write the most important task and the first tiny action it needs.",
        durationMinutes: 8,
      },
      {
        id: "monday-midday-reset",
        title: "Midday reset walk",
        timeOfDay: "midday",
        description:
          "Take an easy walk or stretch break before returning to focus work.",
        durationMinutes: 12,
      },
      {
        id: "monday-close-loop",
        title: "Close one loop",
        timeOfDay: "afternoon",
        description: "Finish or intentionally reschedule one lingering task.",
        durationMinutes: 15,
      },
    ],
  },
  Tuesday: {
    focus: "Protect deep work and support your body with steady breaks.",
    affirmation: "I can move with focus and still take care of myself.",
    tasks: [
      {
        id: "tuesday-focus-block",
        title: "Focused work block",
        timeOfDay: "morning",
        description: "Silence distractions and work on one meaningful outcome.",
        durationMinutes: 45,
      },
      {
        id: "tuesday-hydration-check",
        title: "Hydration check",
        timeOfDay: "midday",
        description:
          "Refill water and pair lunch with a protein or fiber anchor.",
        durationMinutes: 5,
      },
      {
        id: "tuesday-progress-note",
        title: "Progress note",
        timeOfDay: "evening",
        description:
          "Capture what moved forward so tomorrow starts with context.",
        durationMinutes: 7,
      },
    ],
  },
  Wednesday: {
    focus: "Rebalance expectations and keep the middle of the week realistic.",
    affirmation: "I am allowed to adjust the plan.",
    tasks: [
      {
        id: "wednesday-energy-scan",
        title: "Energy scan",
        timeOfDay: "morning",
        description:
          "Rate energy and reduce one commitment if capacity is low.",
        durationMinutes: 6,
      },
      {
        id: "wednesday-connection",
        title: "Connection touchpoint",
        timeOfDay: "afternoon",
        description:
          "Send a kind message or ask for support where it would help.",
        durationMinutes: 10,
      },
      {
        id: "wednesday-room-reset",
        title: "Room reset",
        timeOfDay: "evening",
        description:
          "Clear one visible surface to create a calmer landing place.",
        durationMinutes: 10,
      },
    ],
  },
  Thursday: {
    focus: "Follow through with calm structure and fewer open tabs.",
    affirmation: "Steady effort compounds.",
    tasks: [
      {
        id: "thursday-admin-sprint",
        title: "Admin sprint",
        timeOfDay: "morning",
        description:
          "Batch small messages, bills, or scheduling tasks into one sprint.",
        durationMinutes: 25,
      },
      {
        id: "thursday-strength-break",
        title: "Strength break",
        timeOfDay: "midday",
        description:
          "Do bodyweight squats, wall push-ups, or a short mobility flow.",
        durationMinutes: 10,
      },
      {
        id: "thursday-friday-setup",
        title: "Set up Friday",
        timeOfDay: "evening",
        description: "Choose tomorrow's first task before ending the workday.",
        durationMinutes: 5,
      },
    ],
  },
  Friday: {
    focus: "Celebrate completion and make the weekend easier to enter.",
    affirmation: "I can acknowledge what I completed.",
    tasks: [
      {
        id: "friday-finish-line",
        title: "Finish-line list",
        timeOfDay: "morning",
        description:
          "Identify what truly needs finishing before the week closes.",
        durationMinutes: 10,
      },
      {
        id: "friday-small-celebration",
        title: "Small celebration",
        timeOfDay: "afternoon",
        description:
          "Mark one completed effort with a nourishing reward or pause.",
        durationMinutes: 15,
      },
      {
        id: "friday-weekend-boundary",
        title: "Weekend boundary",
        timeOfDay: "evening",
        description:
          "Write down anything unfinished so it does not need to be carried mentally.",
        durationMinutes: 8,
      },
    ],
  },
  Saturday: {
    focus: "Make room for play, recovery, and light home care.",
    affirmation: "Rest is part of the routine.",
    tasks: [
      {
        id: "saturday-slow-start",
        title: "Slow start",
        timeOfDay: "morning",
        description:
          "Begin without checking obligations for the first few minutes awake.",
        durationMinutes: 10,
      },
      {
        id: "saturday-home-care",
        title: "Home care pocket",
        timeOfDay: "afternoon",
        description: "Tidy, shop, or prep one thing that supports future you.",
        durationMinutes: 30,
      },
      {
        id: "saturday-joy-choice",
        title: "Joy choice",
        timeOfDay: "evening",
        description: "Choose one restorative or playful activity on purpose.",
        durationMinutes: 20,
      },
    ],
  },
};

function toISODateString(date: Date): ISODateString {
  return date.toISOString().slice(0, 10);
}

export function getWeekdayName(date: Date): WeekdayName {
  return weekdayNames[date.getDay()] ?? "Sunday";
}

export function generateDailyPlan(date: Date = new Date()): DailyPlan {
  const weekday = getWeekdayName(date);
  const template = weekdayTemplates[weekday];

  return {
    date: toISODateString(date),
    weekday,
    focus: template.focus,
    affirmation: template.affirmation,
    tasks: template.tasks.map((task) => ({ ...task })),
  };
}

export const dailyPlansFeature: FeatureBoundary = {
  name: "Daily plans",
  phase: "phase-1",
  status: "ready",
};
