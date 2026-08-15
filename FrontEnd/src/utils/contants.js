import { Brain, Feather, Flame, HomeIcon, Zap } from "lucide-react";

export const FOCUS_OPTIONS = [
  {
    value: "balanced",
    label: "Balanced",
    hint: "Mix of focus & meetings",
    icon: Zap,
  },
  {
    value: "deep-work",
    label: "Deep Work",
    hint: "Long focus blocks",
    icon: Brain,
  },
  {
    value: "light",
    label: "Light",
    hint: "Shorter, easier tasks",
    icon: Feather,
  },
];

export const STATS = [
  {
    key: "total",
    label: "Total Tasks",
    icon: HomeIcon,
    valueKey: "total",
    iconMod: "dashboard__stat-icon--total",
    valueMod: "dashboard__stat-value--primary",
  },
  {
    key: "lowPriority",
    label: "Low Priority",
    icon: Flame,
    valueKey: "lowPriority",
    iconMod: "dashboard__stat-icon--low",
    valueMod: "dashboard__stat-value--low",
  },
  {
    key: "mediumPriority",
    label: "Medium Priority",
    icon: Flame,
    valueKey: "mediumPriority",
    iconMod: "dashboard__stat-icon--medium",
    valueMod: "dashboard__stat-value--medium",
  },
  {
    key: "highPriority",
    label: "High Priority",
    icon: Flame,
    valueKey: "highPriority",
    iconMod: "dashboard__stat-icon--high",
    valueMod: "dashboard__stat-value--high",
  },
];

export const FILTER_LABELS = {
  all: "All Tasks",
  today: "Today's Tasks",
  week: "This Week",
  high: "High Priority",
  medium: "Medium Priority",
  low: "Low Priority",
};

export const FILTER_OPTIONS = ["all", "today", "week", "high", "medium", "low"];
