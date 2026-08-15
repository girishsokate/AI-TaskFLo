import { useState, useMemo } from "react";
import {
  Plus,
  Filter,
  Home as HomeIcon,
  Calendar as CalendarIcon,
} from "lucide-react";
import TaskModal from "../components/AddTask";
import TaskItem from "../components/TaskItem";
import { GeneratedPlans } from "../components/GeneratedPlans";
import { FILTER_LABELS, FILTER_OPTIONS, STATS } from "../utils/contants";
import { formatDateValue } from "../utils/planHelpers";
import { useAppShell } from "../context/AppShellContext";
import { usePlannerByDate } from "../hooks/usePlannerByDate";

const Dashboard = () => {
  const { tasks, refreshTasks, selectedDate, onLogout } = useAppShell();
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const { focusMode, plan, hasGenerated } = usePlannerByDate(selectedDate);

  const stats = useMemo(
    () => ({
      total: tasks.length,
      lowPriority: tasks.filter((t) => t.priority?.toLowerCase() === "low")
        .length,
      mediumPriority: tasks.filter(
        (t) => t.priority?.toLowerCase() === "medium",
      ).length,
      highPriority: tasks.filter((t) => t.priority?.toLowerCase() === "high")
        .length,
      completed: tasks.filter(
        (t) =>
          t.completed === true ||
          t.completed === 1 ||
          (typeof t.completed === "string" &&
            t.completed.toLowerCase() === "yes"),
      ).length,
    }),
    [tasks],
  );

  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const today = new Date();
        const dueDate = new Date(task.dueDate);
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        switch (filter) {
          case "today":
            return dueDate.toDateString() === today.toDateString();
          case "week":
            return dueDate >= today && dueDate <= nextWeek;
          case "high":
          case "medium":
          case "low":
            return task.priority?.toLowerCase() === filter;
          default:
            return true;
        }
      }),
    [tasks, filter],
  );

  const handleTaskSave = async () => {
    await refreshTasks();
    setShowModal(false);
    setSelectedTask(null);
  };

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div className="dashboard__heading">
          <h1 className="dashboard__title">
            <HomeIcon size={24} className="dashboard__title-icon" />
            <span>Task Overview</span>
          </h1>
          <p className="dashboard__subtitle">Manage your tasks efficiently</p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="btn btn--primary"
        >
          <Plus size={18} />
          Add New Task
        </button>
      </div>
      <div className="dashboard__col__body">
        <div className="dashboard__col">
          <div className="dashboard__stats">
            {STATS.map(
              ({ key, label, icon: Icon, valueKey, iconMod, valueMod }) => (
                <div key={key} className="dashboard__stat">
                  <div className={`dashboard__stat-icon ${iconMod}`}>
                    <Icon size={20} />
                  </div>
                  <div className="dashboard__stat-body">
                    <p className={`dashboard__stat-value ${valueMod}`}>
                      {stats[valueKey]}
                    </p>
                    <p className="dashboard__stat-label">{label}</p>
                  </div>
                </div>
              ),
            )}
          </div>

          <div className="dashboard__content">
            <div className="dashboard__filter">
              <div className="dashboard__filter-label">
                <Filter size={20} className="dashboard__filter-icon" />
                <h2 className="dashboard__filter-title">
                  {FILTER_LABELS[filter]}
                </h2>
              </div>

              <div className="input-field input-field--filter input-field--sm">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="input-field__control"
                  aria-label="Filter tasks"
                >
                  {FILTER_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="dashboard__tabs" role="tablist">
                {FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    role="tab"
                    aria-selected={filter === opt}
                    onClick={() => setFilter(opt)}
                    className={`dashboard__tab${filter === opt ? " is-active" : ""}`}
                  >
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="dashboard__list">
              {filteredTasks.length === 0 ? (
                <div className="dashboard__empty">
                  <div className="dashboard__empty-icon">
                    <CalendarIcon size={32} />
                  </div>
                  <h3 className="dashboard__empty-title">No tasks found</h3>
                  <p className="dashboard__empty-text">
                    {filter === "all"
                      ? "Create your first task to get started"
                      : "No tasks match this filter"}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="btn btn--primary btn--sm"
                  >
                    Add New Task
                  </button>
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <TaskItem
                    key={task._id || task.id}
                    task={task}
                    onRefresh={refreshTasks}
                    onLogout={onLogout}
                    showCompleteCheckbox
                    onEdit={() => {
                      setSelectedTask(task);
                      setShowModal(true);
                    }}
                  />
                ))
              )}
            </div>

            <TaskModal
              isOpen={showModal || !!selectedTask}
              onClose={() => {
                setShowModal(false);
                setSelectedTask(null);
              }}
              taskToEdit={selectedTask}
              onSave={handleTaskSave}
              onLogout={onLogout}
            />
          </div>
        </div>

        <div className="card dashboard__col">
          <div className="planner__plan-body">
            <h2 className="card__title">
              Day Plan for - {formatDateValue(selectedDate)}
            </h2>
            <GeneratedPlans plan={plan} focusMode={focusMode} />
          </div>

          <div className="card__footer">
            <span className="card__footer-quote">
              &ldquo;The secret of getting ahead is getting started.&rdquo; —
              Mark Twain
            </span>
            <span className="card__footer-tagline">
              Plan well. Achieve more.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
