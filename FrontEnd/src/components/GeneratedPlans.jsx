import React, { useMemo } from "react";
import { Zap, Brain, Feather, Sparkles, Clock } from "lucide-react";

const FOCUS_OPTIONS = [
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

export const GeneratedPlans = ({ plan, focusMode }) => {
  console.log(focusMode);
  const priorityClass = (priority) => {
    const key = priority?.toLowerCase();
    if (key === "high") return "badge--high";
    if (key === "medium") return "badge--medium";
    return "badge--low";
  };

  const totals = useMemo(() => {
    const minutes = plan.reduce((sum, t) => sum + (t.duration || 0), 0);
    const high = plan.filter(
      (t) => t.priority?.toLowerCase() === "high",
    ).length;
    return {
      count: plan.length,
      hours: (minutes / 60).toFixed(1),
      high,
    };
  }, [plan]);
  return (
    <>
      {plan.length > 0 && (
        <div className="planner__summary" aria-live="polite">
          <span className="planner__summary-pill">{totals.count} tasks</span>
          <span className="planner__summary-pill">
            {totals.hours} hrs planned
          </span>
          <span className="planner__summary-pill planner__summary-pill--accent">
            {FOCUS_OPTIONS.find((o) => o.value === focusMode)?.label} mode
          </span>
        </div>
      )}

      <div className="planner__plan-body">
        {plan.length === 0 ? (
          <div className="timeline__empty">
            <div className="timeline__empty-icon" aria-hidden>
              <Sparkles size={28} strokeWidth={1.5} />
            </div>
            <p className="timeline__empty-title">No plan yet</p>
            <p>
              Add a goal, choose how you want to work, then generate your day.
            </p>
          </div>
        ) : (
          <div className="timeline">
            {plan.map((item, index) => (
              <div
                key={item.id}
                className="timeline__item"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="timeline__time">
                  {item.start && item.end
                    ? `${item.start}\n– ${item.end}`
                    : `${item.duration} min`}
                </div>
                <div className="timeline__rail">
                  <span className="timeline__dot" />
                </div>
                <article className="timeline__card">
                  <div className="timeline__card-main">
                    <h3 className="timeline__card-title">{item.title}</h3>
                    {item.description && (
                      <p className="timeline__card-desc">{item.description}</p>
                    )}
                    <span className="timeline__card-duration">
                      <Clock size={12} />
                      {item.duration} min
                    </span>
                  </div>
                  <span className={`badge ${priorityClass(item.priority)}`}>
                    <span className="badge__dot" />
                    {item.priority}
                  </span>
                </article>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
