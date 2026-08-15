import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Sparkles,
  Calendar,
  Clock,
  ListTodo,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  Trash2,
  CalendarDays,
} from "lucide-react";
import { GeneratedPlans } from "../components/GeneratedPlans";
import { generatePlanner } from "../utils/axios.js";
import { formatDateValue } from "../utils/planHelpers.js";
import { FOCUS_OPTIONS } from "../utils/contants.js";
import { useAppShell } from "../context/AppShellContext";
import { usePlannerByDate } from "../hooks/usePlannerByDate";

const todayISO = () => new Date().toISOString().slice(0, 10);

const plansSchema = yup.object({
  goal: yup
    .string()
    .trim()
    .required("Goal / prompt is required")
    .min(10, "Describe your goal in at least 10 characters")
    .max(500, "Goal cannot exceed 500 characters"),
  date: yup
    .string()
    .required("Date is required")
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date"),
  availableHours: yup
    .number()
    .typeError("Available hours must be a number")
    .required("Available hours is required")
    .min(1, "Minimum 1 hour")
    .max(16, "Maximum 16 hours"),
  focusMode: yup
    .string()
    .oneOf(
      FOCUS_OPTIONS.map((o) => o.value),
      "Select a valid focus mode",
    )
    .required("Focus mode is required"),
  taskCount: yup
    .number()
    .typeError("Number of tasks must be a number")
    .required("Number of tasks is required")
    .integer("Number of tasks must be a whole number")
    .min(1, "At least 1 task")
    .max(12, "Maximum 12 tasks"),
});

const priorityClass = (priority) => {
  const key = priority?.toLowerCase();
  if (key === "high") return "badge--high";
  if (key === "medium") return "badge--medium";
  return "badge--low";
};

const Plans = () => {
  const { selectedDate, setSelectedDate } = useAppShell();
  const {
    plan,
    hasGenerated,
    setHasGenerated,
    error: submitError,
    setError: setSubmitError,
    applyPlan,
    clearPlan,
  } = usePlannerByDate(selectedDate);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(plansSchema),
    defaultValues: {
      goal: "",
      date: selectedDate || todayISO(),
      availableHours: 6,
      focusMode: "balanced",
      taskCount: 5,
    },
    mode: "onBlur",
  });

  const goalValue = watch("goal") || "";
  const focusMode = watch("focusMode") || "balanced";
  const taskCount = watch("taskCount") ?? 5;
  const dateValue = watch("date") || selectedDate;

  // Keep form date in sync when Navbar changes the shared selectedDate
  useEffect(() => {
    if (!selectedDate) return;
    if (getValues("date") !== selectedDate) {
      setValue("date", selectedDate, {
        shouldValidate: true,
        shouldDirty: false,
      });
    }
  }, [selectedDate, setValue, getValues]);

  const formattedDate = useMemo(() => formatDateValue(dateValue), [dateValue]);

  const bumpTasks = (delta) => {
    const current = Number(getValues("taskCount")) || 1;
    const next = Math.min(12, Math.max(1, current + delta));
    setValue("taskCount", next, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = async (formData) => {
    setSubmitError("");
    setSelectedDate(formData.date);
    setHasGenerated(false);
    const payload = {
      goal: formData.goal.trim(),
      date: formData.date,
      availableHours: Number(formData.availableHours),
      focusMode: formData.focusMode,
      taskCount: Number(formData.taskCount),
    };

    try {
      const { data } = await generatePlanner(payload);

      if (!data.success) {
        throw new Error(data.message || "Failed to generate plan");
      }

      applyPlan(data);
    } catch (err) {
      console.error(err);
      setSubmitError(
        err.response?.data?.message ||
          err.message ||
          "Could not generate plan. Try again.",
      );
    }
  };

  const handleClear = () => {
    clearPlan();
  };

  return (
    <div className="planner">
      <header className="planner__intro">
        <div>
          <p className="planner__eyebrow">Daily schedule</p>
          <h1 className="planner__heading">Plans</h1>
          <p className="planner__subhead">
            Shape your day for <strong>{formattedDate}</strong>. Set a goal,
            pick a focus mode, and generate a timed schedule.
          </p>
        </div>
        {/* <div className="planner__intro-stats" aria-label="Plan overview">
          <div className="planner__stat">
            <span className="planner__stat-value">{totals.count}</span>
            <span className="planner__stat-label">Blocks</span>
          </div>
          <div className="planner__stat">
            <span className="planner__stat-value">{totals.hours}</span>
            <span className="planner__stat-label">Hours</span>
          </div>
          <div className="planner__stat">
            <span className="planner__stat-value">{totals.high}</span>
            <span className="planner__stat-label">High priority</span>
          </div>
        </div> */}
      </header>

      <div className="planner__grid">
        <section className="card planner__details">
          <div className="card__header">
            <h2 className="card__title">Plan Details</h2>
            <span className="card__meta">
              <CalendarDays size={12} />
              {formattedDate}
            </span>
          </div>

          <form
            className="card__body"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            {submitError && (
              <div
                className="form-message form-message--error"
                style={{ marginBottom: 0 }}
              >
                {submitError}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="goal">
                Goal / Prompt
              </label>
              <div
                className={`textarea-field${errors.goal ? " is-error" : ""}`}
              >
                <textarea
                  id="goal"
                  className="textarea-field__control textarea-field__control--lg"
                  placeholder="e.g. Finish the dashboard UI, clear urgent emails, and leave room for a workout…"
                  aria-invalid={!!errors.goal}
                  {...register("goal")}
                />
                <span className="textarea-field__counter">
                  {goalValue.length} / 500
                </span>
              </div>
              {errors.goal && (
                <p className="form-field-error">{errors.goal.message}</p>
              )}
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="plan-date">
                  Date
                </label>
                <div className={`input-field${errors.date ? " is-error" : ""}`}>
                  <span className="input-field__icon">
                    <Calendar size={16} />
                  </span>
                  <input
                    id="plan-date"
                    type="date"
                    className="input-field__control"
                    aria-invalid={!!errors.date}
                    {...register("date", {
                      onChange: (e) => setSelectedDate?.(e.target.value),
                    })}
                  />
                </div>
                {errors.date && (
                  <p className="form-field-error">{errors.date.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="hours">
                  Available Hours
                </label>
                <div
                  className={`input-field${errors.availableHours ? " is-error" : ""}`}
                >
                  <span className="input-field__icon">
                    <Clock size={16} />
                  </span>
                  <input
                    id="hours"
                    type="number"
                    step={0.5}
                    className="input-field__control"
                    aria-invalid={!!errors.availableHours}
                    {...register("availableHours")}
                  />
                  <span className="input-field__suffix">hrs</span>
                </div>
                {errors.availableHours && (
                  <p className="form-field-error">
                    {errors.availableHours.message}
                  </p>
                )}
              </div>

              <div className="form-group form-group--span">
                <label className="form-label" id="focus-label">
                  Focus Mode
                </label>
                <div
                  className="planner__focus"
                  role="radiogroup"
                  aria-labelledby="focus-label"
                  aria-invalid={!!errors.focusMode}
                >
                  {FOCUS_OPTIONS.map(({ value, label, hint, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={focusMode === value}
                      className={`planner__focus-chip${
                        focusMode === value ? " is-active" : ""
                      }`}
                      onClick={() =>
                        setValue("focusMode", value, {
                          shouldValidate: true,
                          shouldDirty: true,
                        })
                      }
                    >
                      <span className="planner__focus-icon">
                        <Icon size={16} strokeWidth={2} />
                      </span>
                      <span className="planner__focus-text">
                        <span className="planner__focus-label">{label}</span>
                        <span className="planner__focus-hint">{hint}</span>
                      </span>
                    </button>
                  ))}
                </div>
                <input type="hidden" {...register("focusMode")} />
                {errors.focusMode && (
                  <p className="form-field-error">{errors.focusMode.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="task-count">
                  Number of Tasks
                </label>
                <div
                  className={`input-field${errors.taskCount ? " is-error" : ""}`}
                >
                  <span className="input-field__icon">
                    <ListTodo size={16} />
                  </span>
                  <input
                    id="task-count"
                    type="number"
                    className="input-field__control"
                    aria-invalid={!!errors.taskCount}
                    {...register("taskCount")}
                  />
                  <div className="input-field__stepper">
                    <button
                      type="button"
                      onClick={() => bumpTasks(1)}
                      aria-label="Increase tasks"
                    >
                      <ChevronUp size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => bumpTasks(-1)}
                      aria-label="Decrease tasks"
                    >
                      <ChevronDown size={12} />
                    </button>
                  </div>
                </div>
                {errors.taskCount && (
                  <p className="form-field-error">{errors.taskCount.message}</p>
                )}
              </div>
            </div>

            <div className="planner__actions">
              <button
                type="submit"
                className="btn btn--primary btn--block btn--lg"
                disabled={isSubmitting}
              >
                <Sparkles size={18} />
                {isSubmitting ? "Generating…" : "Generate Plan"}
              </button>
              <p className="form-hint">
                AI will create an optimized schedule based on your inputs
                {taskCount ? ` (${taskCount} tasks)` : ""}
              </p>
            </div>
          </form>
        </section>

        <section className="card planner__plan">
          <div className="card__header">
            <h2 className="card__title">Your Day Timeline</h2>
            {hasGenerated && (
              <div className="planner__plan-actions">
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                  title="Regenerate"
                >
                  <RefreshCw size={14} />
                  Regenerate
                </button>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={handleClear}
                  title="Clear plan"
                >
                  <Trash2 size={14} />
                  Clear
                </button>
              </div>
            )}
          </div>

          {hasGenerated && <GeneratedPlans plan={plan} focusMode={focusMode} />}

          <div className="card__footer">
            <span className="card__footer-quote">
              &ldquo;The secret of getting ahead is getting started.&rdquo; —
              Mark Twain
            </span>
            <span className="card__footer-tagline">
              Plan well. Achieve more.
            </span>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Plans;
