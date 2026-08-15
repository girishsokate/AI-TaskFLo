import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAppShell } from "../context/AppShellContext";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subWeeks,
  subMonths,
  subYears,
  subDays,
  eachDayOfInterval,
  format,
  isValid,
  startOfDay,
  isWithinInterval,
  getDay,
} from "date-fns";
import {
  Calendar,
  ChevronDown,
  Flame,
  Lightbulb,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

const PERIOD_OPTIONS = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

const CATEGORY_COLORS = {
  Work: "#2563eb",
  Personal: "#38bdf8",
  Health: "#f59e0b",
  Learning: "#a78bfa",
  Development: "#2563eb",
  Design: "#10b981",
  Marketing: "#a78bfa",
  General: "#64748b",
  Extras: "#94a3b8",
  Other: "#94a3b8",
};

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const toDate = (value) => {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return isValid(d) ? d : null;
};

const isCompleted = (task) =>
  task.completed === true ||
  task.completed === 1 ||
  task.completed === "Yes" ||
  String(task.completed || "").toLowerCase() === "yes" ||
  task.status === "done";

const getCategory = (task) => {
  if (Array.isArray(task.tags) && task.tags.length) {
    const tag = task.tags.find((t) => t && t !== "ai-generated") || task.tags[0];
    if (tag && tag !== "ai-generated") {
      return tag.charAt(0).toUpperCase() + tag.slice(1);
    }
  }
  const priority = task.priority?.toLowerCase();
  if (priority === "high") return "Work";
  if (priority === "medium") return "Personal";
  if (priority === "low") return "Other";
  return "Other";
};

const completionDate = (task) =>
  toDate(task.dueDate) || toDate(task.updatedAt) || toDate(task.createdAt);

const createdDate = (task) => toDate(task.createdAt) || toDate(task.dueDate);

const getPeriodBounds = (period, anchor = new Date()) => {
  if (period === "monthly") {
    return { start: startOfMonth(anchor), end: endOfMonth(anchor) };
  }
  if (period === "yearly") {
    return { start: startOfYear(anchor), end: endOfYear(anchor) };
  }
  return {
    start: startOfWeek(anchor, { weekStartsOn: 1 }),
    end: endOfWeek(anchor, { weekStartsOn: 1 }),
  };
};

const getPreviousAnchor = (period, anchor = new Date()) => {
  if (period === "monthly") return subMonths(anchor, 1);
  if (period === "yearly") return subYears(anchor, 1);
  return subWeeks(anchor, 1);
};

const formatRangeLabel = (start, end) =>
  `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;

const formatFocusDuration = (minutes) => {
  const mins = Math.max(0, Math.round(minutes || 0));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

const percentChange = (current, previous) => {
  if (previous === 0) {
    if (current === 0) return { label: "0%", up: true, flat: true };
    return { label: "↑ 100%", up: true, flat: false };
  }
  const raw = ((current - previous) / previous) * 100;
  const rounded = Math.round(raw);
  if (rounded === 0) return { label: "0%", up: true, flat: true };
  if (rounded > 0) return { label: `↑ ${rounded}%`, up: true, flat: false };
  return { label: `↓ ${Math.abs(rounded)}%`, up: false, flat: false };
};

const calcStreak = (tasks) => {
  const days = new Set();
  tasks.filter(isCompleted).forEach((task) => {
    const d = completionDate(task);
    if (d) days.add(format(startOfDay(d), "yyyy-MM-dd"));
  });

  let streak = 0;
  let cursor = startOfDay(new Date());
  if (!days.has(format(cursor, "yyyy-MM-dd"))) {
    cursor = subDays(cursor, 1);
  }
  while (days.has(format(cursor, "yyyy-MM-dd"))) {
    streak += 1;
    cursor = subDays(cursor, 1);
  }
  return streak;
};

const tasksInRange = (tasks, start, end) =>
  tasks.filter((task) => {
    const created = createdDate(task);
    const completed = isCompleted(task) ? completionDate(task) : null;
    const inCreated =
      created && isWithinInterval(created, { start, end });
    const inCompleted =
      completed && isWithinInterval(completed, { start, end });
    return inCreated || inCompleted;
  });

const buildOverview = (tasks, start, end, period) => {
  const days = eachDayOfInterval({ start, end });

  // For yearly view, aggregate by month instead of day
  if (period === "yearly") {
    const months = Array.from({ length: 12 }, (_, i) => {
      const monthStart = new Date(start.getFullYear(), i, 1);
      return {
        key: format(monthStart, "yyyy-MM"),
        day: format(monthStart, "MMM"),
        completed: 0,
        created: 0,
      };
    });
    const byKey = Object.fromEntries(months.map((m) => [m.key, m]));

    tasks.forEach((task) => {
      const created = createdDate(task);
      if (created && isWithinInterval(created, { start, end })) {
        const key = format(created, "yyyy-MM");
        if (byKey[key]) byKey[key].created += 1;
      }
      if (isCompleted(task)) {
        const done = completionDate(task);
        if (done && isWithinInterval(done, { start, end })) {
          const key = format(done, "yyyy-MM");
          if (byKey[key]) byKey[key].completed += 1;
        }
      }
    });
    return months;
  }

  return days.map((day) => {
    const dayStart = startOfDay(day);
    const created = tasks.filter((task) => {
      const d = createdDate(task);
      return d && format(startOfDay(d), "yyyy-MM-dd") === format(dayStart, "yyyy-MM-dd");
    }).length;
    const completed = tasks.filter((task) => {
      if (!isCompleted(task)) return false;
      const d = completionDate(task);
      return d && format(startOfDay(d), "yyyy-MM-dd") === format(dayStart, "yyyy-MM-dd");
    }).length;
    return {
      day: format(day, period === "monthly" ? "d" : "MMM d"),
      completed,
      created,
    };
  });
};

const buildCategories = (tasks) => {
  if (!tasks.length) {
    return { categories: [], total: 0 };
  }
  const counts = {};
  tasks.forEach((task) => {
    const cat = getCategory(task);
    counts[cat] = (counts[cat] || 0) + 1;
  });
  const total = tasks.length;
  const categories = Object.entries(counts)
    .map(([name, count]) => ({
      name,
      count,
      value: Math.round((count / total) * 100),
      color: CATEGORY_COLORS[name] || CATEGORY_COLORS.Other,
    }))
    .sort((a, b) => b.count - a.count);

  // Fix rounding so percentages sum closer to 100
  const sum = categories.reduce((s, c) => s + c.value, 0);
  if (categories.length && sum !== 100) {
    categories[0].value += 100 - sum;
  }

  return { categories, total };
};

const buildFocusByDay = (tasks, start, end) => {
  const hours = Array(7).fill(0);
  tasks.forEach((task) => {
    const d = completionDate(task) || createdDate(task);
    if (!d || !isWithinInterval(d, { start, end })) return;
    const mins = Number(task.estimatedMinutes) || (isCompleted(task) ? 30 : 0);
    if (!mins) return;
    hours[getDay(d)] += mins / 60;
  });

  // Monday-first order to match mockup
  const order = [1, 2, 3, 4, 5, 6, 0];
  return order.map((idx) => ({
    day: WEEKDAY_LABELS[idx],
    hours: Math.round(hours[idx] * 10) / 10,
  }));
};

const buildInsight = (focusByDay, overview) => {
  const topFocus = [...focusByDay].sort((a, b) => b.hours - a.hours)[0];
  const topDays = [...focusByDay]
    .filter((d) => d.hours > 0)
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 2)
    .map((d) => d.day);

  if (topDays.length >= 2) {
    return `You're most productive on ${topDays[0]} and ${topDays[1]} based on focus time.`;
  }
  if (topFocus && topFocus.hours > 0) {
    return `Your strongest focus day is ${topFocus.day} (${topFocus.hours}h logged).`;
  }

  const busiest = [...overview].sort(
    (a, b) => b.completed + b.created - (a.completed + a.created),
  )[0];
  if (busiest && busiest.completed + busiest.created > 0) {
    return `Your busiest day in this range was ${busiest.day}.`;
  }
  return "Complete a few tasks to unlock personalized productivity insights.";
};

const chartTooltipStyle = {
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  boxShadow: "0 8px 30px rgba(15, 23, 42, 0.08)",
  fontSize: 12,
};

const TasksOverviewChart = ({ data }) => {
  if (!data.length) {
    return <p className="analytics__empty">No task activity in this range.</p>;
  }

  return (
    <div className="analytics__chart">
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#eef2f7" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={{ stroke: "#e2e8f0" }}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip contentStyle={chartTooltipStyle} />
          <Line
            type="monotone"
            dataKey="completed"
            name="Completed"
            stroke="#22c55e"
            strokeWidth={2.5}
            dot={{ r: 3.5, fill: "#22c55e", strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="created"
            name="Created"
            stroke="#2563eb"
            strokeWidth={2.5}
            dot={{ r: 3.5, fill: "#2563eb", strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const CategoryDonut = ({ categories, total }) => {
  if (!categories.length) {
    return <p className="analytics__empty">No categories to show yet.</p>;
  }

  const pieData = categories.map((cat) => ({
    name: cat.name,
    value: cat.count ?? cat.value,
    percent: cat.value,
    color: cat.color,
  }));

  return (
    <div className="analytics__donut-wrap">
      <div className="analytics__donut-chart">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={82}
              paddingAngle={2}
              stroke="#fff"
              strokeWidth={2}
            >
              {pieData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={chartTooltipStyle}
              formatter={(value, name, item) => [
                `${value} (${item?.payload?.percent ?? 0}%)`,
                name,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="analytics__donut-center">
          <span className="analytics__donut-label">Total</span>
          <strong className="analytics__donut-total">{total}</strong>
        </div>
      </div>

      <ul className="analytics__legend-list">
        {categories.map((cat) => (
          <li key={cat.name} className="analytics__legend-item">
            <span
              className="analytics__legend-swatch"
              style={{ background: cat.color }}
            />
            <span className="analytics__legend-name">{cat.name}</span>
            <span className="analytics__legend-value">{cat.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const FocusBarChart = ({ data }) => {
  const hasHours = data.some((d) => (d.hours || 0) > 0);

  if (!hasHours) {
    return <p className="analytics__empty">No focus time logged in this range.</p>;
  }

  return (
    <div className="analytics__chart">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#eef2f7" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={{ stroke: "#e2e8f0" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={36}
            tickFormatter={(v) => `${v}h`}
          />
          <Tooltip
            contentStyle={chartTooltipStyle}
            formatter={(value) => [`${value}h`, "Focus"]}
          />
          <Bar
            dataKey="hours"
            name="Focus"
            fill="#2563eb"
            radius={[8, 8, 4, 4]}
            maxBarSize={36}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const Analytics = () => {
  const { tasks = [] } = useAppShell();
  const [period, setPeriod] = useState("weekly");
  const [rangeOffset, setRangeOffset] = useState(0); // 0 = current, 1 = previous, ...

  const analytics = useMemo(() => {
    const now = new Date();
    let anchor = now;
    if (rangeOffset > 0) {
      for (let i = 0; i < rangeOffset; i += 1) {
        anchor = getPreviousAnchor(period, anchor);
      }
    }

    const { start, end } = getPeriodBounds(period, anchor);
    const prevAnchor = getPreviousAnchor(period, start);
    const prevBounds = getPeriodBounds(period, prevAnchor);

    const currentTasks = tasksInRange(tasks, start, end);
    const previousTasks = tasksInRange(tasks, prevBounds.start, prevBounds.end);

    const completedPrev = previousTasks.filter(isCompleted).length;

    // Prefer tasks created or active in range for denominator
    const createdInRange = tasks.filter((t) => {
      const d = createdDate(t);
      return d && isWithinInterval(d, { start, end });
    });
    const completedInRange = tasks.filter((t) => {
      if (!isCompleted(t)) return false;
      const d = completionDate(t);
      return d && isWithinInterval(d, { start, end });
    });

    const focusMinutes = completedInRange.reduce(
      (sum, t) => sum + (Number(t.estimatedMinutes) || 30),
      0,
    );
    const focusMinutesPrev = previousTasks
      .filter(isCompleted)
      .reduce((sum, t) => sum + (Number(t.estimatedMinutes) || 30), 0);

    const scoreDenom = Math.max(createdInRange.length, completedInRange.length, 1);
    const score = Math.min(
      100,
      Math.round((completedInRange.length / scoreDenom) * 100),
    );
    const scorePrevDenom = Math.max(previousTasks.length, 1);
    const scorePrev = Math.min(
      100,
      Math.round(
        (previousTasks.filter(isCompleted).length / scorePrevDenom) * 100,
      ),
    );

    const overview = buildOverview(tasks, start, end, period);
    const { categories, total: categoryTotal } = buildCategories(
      createdInRange.length ? createdInRange : currentTasks,
    );
    const focusByDay = buildFocusByDay(tasks, start, end);
    const streak = calcStreak(tasks);
    const insight = buildInsight(focusByDay, overview);

    const completedTrend = percentChange(completedInRange.length, completedPrev);
    const scoreTrend = percentChange(score, scorePrev);
    const focusTrend = percentChange(focusMinutes, focusMinutesPrev);

    // Range select options: current + previous windows
    const rangeOptions = [0, 1, 2].map((offset) => {
      let a = now;
      for (let i = 0; i < offset; i += 1) a = getPreviousAnchor(period, a);
      const bounds = getPeriodBounds(period, a);
      return {
        value: String(offset),
        label: formatRangeLabel(bounds.start, bounds.end),
      };
    });

    return {
      rangeLabel: formatRangeLabel(start, end),
      rangeOptions,
      overview,
      categories,
      categoryTotal: categoryTotal || completedInRange.length || createdInRange.length,
      focusByDay,
      insight,
      kpis: [
        {
          key: "completed",
          label: "Tasks Completed",
          value: String(completedInRange.length),
          trend: completedTrend.label,
          trendUp: completedTrend.up,
          flat: completedTrend.flat,
        },
        {
          key: "score",
          label: "Productivity Score",
          value: `${score}%`,
          trend: scoreTrend.label,
          trendUp: scoreTrend.up,
          flat: scoreTrend.flat,
        },
        {
          key: "focus",
          label: "Focus Time",
          value: formatFocusDuration(focusMinutes),
          trend: focusTrend.label,
          trendUp: focusTrend.up,
          flat: focusTrend.flat,
        },
        {
          key: "streak",
          label: "Streak",
          value: `${streak} Day${streak === 1 ? "" : "s"}`,
          streak: true,
        },
      ],
      hasData: tasks.length > 0,
    };
  }, [tasks, period, rangeOffset]);

  return (
    <div className="analytics">
      <header className="analytics__header">
        <h1 className="analytics__title">Analytics</h1>
        <div className="analytics__controls">
          <label className="analytics__select">
            <Calendar size={15} strokeWidth={1.75} />
            <select
              value={String(rangeOffset)}
              onChange={(e) => setRangeOffset(Number(e.target.value))}
              aria-label="Date range"
            >
              {analytics.rangeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="analytics__select-caret" />
          </label>

          <label className="analytics__select analytics__select--sm">
            <select
              value={period}
              onChange={(e) => {
                setPeriod(e.target.value);
                setRangeOffset(0);
              }}
              aria-label="Period"
            >
              {PERIOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="analytics__select-caret" />
          </label>
        </div>
      </header>

      {!analytics.hasData && (
        <div className="card analytics__banner">
          <p>
            No tasks found yet. Create tasks on the Dashboard or Task Board to
            populate analytics.
          </p>
        </div>
      )}

      <section className="analytics__kpis" aria-label="Key metrics">
        {analytics.kpis.map((card) => (
          <article key={card.key} className="analytics__kpi card">
            <p className="analytics__kpi-label">{card.label}</p>
            <div className="analytics__kpi-row">
              <p className="analytics__kpi-value">{card.value}</p>
              {card.streak ? (
                <span className="analytics__kpi-flame" aria-hidden>
                  <Flame size={18} strokeWidth={2} />
                </span>
              ) : (
                <span
                  className={`analytics__kpi-trend${
                    card.trendUp && !card.flat ? " is-up" : ""
                  }${
                    !card.trendUp && !card.flat ? " is-down" : ""
                  }`}
                >
                  {card.trendUp || card.flat ? (
                    <TrendingUp size={12} />
                  ) : (
                    <TrendingDown size={12} />
                  )}
                  {card.trend}
                </span>
              )}
            </div>
          </article>
        ))}
      </section>

      <section className="card analytics__panel">
        <div className="analytics__panel-head">
          <h2 className="analytics__panel-title">Tasks Overview</h2>
          <div className="analytics__legend">
            <span className="analytics__legend-pill">
              <i className="analytics__legend-dot analytics__legend-dot--completed" />
              Completed
            </span>
            <span className="analytics__legend-pill">
              <i className="analytics__legend-dot analytics__legend-dot--created" />
              Created
            </span>
          </div>
        </div>
        <TasksOverviewChart data={analytics.overview} />
        <p className="analytics__range-note">{analytics.rangeLabel}</p>
      </section>

      <div className="analytics__split">
        <section className="card analytics__panel">
          <div className="analytics__panel-head">
            <h2 className="analytics__panel-title">Tasks by Category</h2>
          </div>
          <CategoryDonut
            categories={analytics.categories}
            total={analytics.categoryTotal}
          />
        </section>

        <section className="card analytics__panel">
          <div className="analytics__panel-head">
            <h2 className="analytics__panel-title">Focus Time (by day)</h2>
          </div>
          <FocusBarChart data={analytics.focusByDay} />
        </section>
      </div>

      <section className="analytics__insight card">
        <div className="analytics__insight-main">
          <span className="analytics__insight-icon" aria-hidden>
            <Lightbulb size={18} strokeWidth={1.75} />
          </span>
          <div>
            <h2 className="analytics__insight-title">
              Top Productivity Insights
            </h2>
            <p className="analytics__insight-text">{analytics.insight}</p>
          </div>
        </div>
        <Link to="/plans" className="analytics__insight-link">
          View all insights
        </Link>
      </section>
    </div>
  );
};

export default Analytics;
