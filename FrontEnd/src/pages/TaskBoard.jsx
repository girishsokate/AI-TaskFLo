import { useMemo, useState, useEffect, useRef } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import TaskModal from "../components/AddTask";
import TaskCard from "../components/TaskCard";
import TaskSearchbar from "../components/TaskSearchbar";
import Droppable from "../components/Droppable";
import { useAppShell } from "../context/AppShellContext";
import { updateTaskStatus } from "../utils/axios";
import { Plus } from "lucide-react";

const COLUMNS = [
  { id: "todo", title: "To Do" },
  { id: "inprogress", title: "In Progress" },
  { id: "done", title: "Done" },
];

const EMPTY_COLUMNS = () => Object.fromEntries(COLUMNS.map((c) => [c.id, []]));

const SAMPLE_TASKS = [
  {
    id: "s1",
    title: "Redesign pricing page",
    category: "Marketing",
    column: "todo",
    dueDate: "2026-05-10",
    assignee: "Alex Rivera",
  },
  {
    id: "s2",
    title: "Fix authentication bug",
    category: "Development",
    column: "todo",
    dueDate: "2026-05-12",
    assignee: "Sam Chen",
  },
  {
    id: "s3",
    title: "Write blog post draft",
    category: "Marketing",
    column: "todo",
    dueDate: "2026-05-15",
    assignee: "Jordan Lee",
  },
  {
    id: "s4",
    title: "Update onboarding flow",
    category: "Design",
    column: "inprogress",
    dueDate: "2026-05-11",
    assignee: "Alex Rivera",
  },
  {
    id: "s5",
    title: "API integration testing",
    category: "Development",
    column: "inprogress",
    dueDate: "2026-05-13",
    assignee: "Sam Chen",
  },
  {
    id: "s8",
    title: "Deploy staging build",
    category: "Development",
    column: "done",
    dueDate: "2026-05-08",
    assignee: "Sam Chen",
  },
  {
    id: "s9",
    title: "Logo refinements",
    category: "Design",
    column: "done",
    dueDate: "2026-05-07",
    assignee: "Jordan Lee",
  },
  {
    id: "s10",
    title: "Q2 campaign outline",
    category: "Marketing",
    column: "done",
    dueDate: "2026-05-06",
    assignee: "Alex Rivera",
  },
];

const categoryClass = (category) => {
  const key = category?.toLowerCase();
  if (key === "marketing") return "board-tag--marketing";
  if (key === "development") return "board-tag--development";
  if (key === "design") return "board-tag--design";
  if (key === "work") return "board-tag--work";
  return "board-tag--default";
};

const formatDue = (dueDate) => {
  if (!dueDate) return null;
  const d = new Date(
    typeof dueDate === "string" && dueDate.length <= 10
      ? `${dueDate}T00:00:00`
      : dueDate,
  );
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const avatarUrl = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "U")}&background=dbeafe&color=1d4ed8&size=64`;

const mapApiTask = (task) => {
  const done =
    task.completed === true ||
    task.completed === 1 ||
    task.completed === "Yes" ||
    task.status === "done";

  let column = "todo";
  if (done) column = "done";
  else if (task.status === "inprogess") column = "inprogress";
  else if (task.status === "overdue" || task.status === "pending")
    column = "todo";

  const tags = Array.isArray(task.tags)
    ? task.tags.map((t) => String(t).trim()).filter(Boolean)
    : [];
  const primaryTag =
    tags.find((t) => t && t.toLowerCase() !== "ai-generated") || tags[0] || null;
  const priority = task.priority?.toLowerCase();
  let category = primaryTag || "Work";
  if (!primaryTag) {
    if (priority === "high") category = "Personal";
    else if (priority === "medium") category = "General";
    else if (priority === "low") category = "Extras";
  }

  return {
    id: String(task._id || task.id),
    title: task.title,
    priority,
    tags,
    category,
    column,
    dueDate: task.dueDate,
    assignee: task.owner?.name || "You",
    source: "api",
  };
};

const buildBoard = (taskList) => {
  const taskMap = {};
  const items = EMPTY_COLUMNS();

  taskList.forEach((task) => {
    const id = String(task.id);
    const column = items[task.column] ? task.column : "todo";
    taskMap[id] = { ...task, id, column };
    items[column].push(id);
  });

  return { taskMap, items };
};

const taskMatches = (task, search, categoryFilter) => {
  if (!task) return false;
  const q = search.trim().toLowerCase();
  const matchesSearch =
    !q ||
    task.title.toLowerCase().includes(q) ||
    task.category?.toLowerCase().includes(q) ||
    (Array.isArray(task.tags) &&
      task.tags.some((t) => t.toLowerCase().includes(q)));
  const matchesCategory =
    categoryFilter === "all" || task.category === categoryFilter;
  return matchesSearch && matchesCategory;
};

const TaskBoard = () => {
  const { tasks = [], refreshTasks, onLogout } = useAppShell();
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);

  const [taskMap, setTaskMap] = useState({});
  const [items, setItems] = useState(EMPTY_COLUMNS);
  const itemsSnapshot = useRef(items);

  // Layout only renders this page after tasks finish loading
  useEffect(() => {
    console.log("IN Board");
    const fromApi = (tasks || []).map(mapApiTask);
    const source = fromApi.length > 0 ? fromApi : SAMPLE_TASKS;
    const board = buildBoard(source);
    setTaskMap(board.taskMap);
    setItems(board.items);
    itemsSnapshot.current = board.items;
    // intentionally once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categories = useMemo(() => {
    const set = new Set(
      Object.values(taskMap)
        .map((t) => t.category)
        .filter(Boolean),
    );
    return ["all", ...Array.from(set)];
  }, [taskMap]);

  const filtering = search.trim().length > 0 || categoryFilter !== "all";

  const displayColumnIds = (colId) => {
    let ids = [...(items[colId] || [])];
    if (!filtering) return ids;
    return ids.filter((id) =>
      taskMatches(taskMap[id], search, categoryFilter),
    );
  };

  const handleSortToggle = () => {
    setSortAsc((prevAsc) => {
      const nextAsc = !prevAsc;
      setItems((prev) => {
        const next = EMPTY_COLUMNS();
        COLUMNS.forEach(({ id }) => {
          next[id] = [...(prev[id] || [])].sort((a, b) => {
            const da = taskMap[a]?.dueDate
              ? new Date(taskMap[a].dueDate).getTime()
              : 0;
            const db = taskMap[b]?.dueDate
              ? new Date(taskMap[b].dueDate).getTime()
              : 0;
            return nextAsc ? da - db : db - da;
          });
        });
        return next;
      });
      return nextAsc;
    });
  };

  const handleSave = async (saved) => {
    if (saved?.title) {
      const mapped = mapApiTask(saved);
      setTaskMap((prev) => ({ ...prev, [mapped.id]: mapped }));
      setItems((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((col) => {
          next[col] = next[col].filter((id) => id !== mapped.id);
        });
        const col = next[mapped.column] ? mapped.column : "todo";
        next[col] = [...next[col], mapped.id];
        return next;
      });
    }
    refreshTasks?.();
    setShowModal(false);
  };

  const openCreate = () => setShowModal(true);

  const updateTaskColumn = async (id, column) => {
    try {
      const { data } = await updateTaskStatus(id, column);
      const saved = data?.task || data;
      if (saved?._id || saved?.id || saved?.title) {
        const mapped = mapApiTask({
          ...saved,
          status: column === "done" ? "done" : saved.status,
        });
        mapped.column = column;
        setTaskMap((prev) => ({
          ...prev,
          [id]: { ...prev[id], ...mapped, id, column },
        }));
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) onLogout?.();
    }
  };

  const handleDragStart = () => {
    itemsSnapshot.current = structuredClone(items);
  };

  const handleDragOver = (event) => {
    const { source } = event.operation;
    if (source?.type === "column") return;
    setItems((current) => move(current, event));
  };

  const handleDragEnd = (event) => {
    if (event.canceled) {
      setItems(itemsSnapshot.current);
      return;
    }

    const { source } = event.operation;

    if (source?.type === "item" && source.group != null) {
      setTaskMap((prev) => {
        const task = prev[source.id];
        if (!task || task.column === source.group) return prev;
        return {
          ...prev,
          [source.id]: { ...task, column: source.group },
        };
      });
      updateTaskColumn(source.id, source.group);
    }
  };

  return (
    <div className="taskboard">
      <header className="taskboard__header">
        <h1 className="taskboard__title">Task Board</h1>
        <TaskSearchbar
          search={search}
          setSearch={setSearch}
          categories={categories}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          setSortAsc={handleSortToggle}
          openCreate={openCreate}
        />
      </header>

      <DragDropProvider
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="taskboard__board" role="list">
          {COLUMNS.map((col) => {
            const columnIds = filtering
              ? displayColumnIds(col.id)
              : items[col.id] || [];
            const dragDisabled = filtering;
            return (
              <Droppable key={col.id} id={col.id}>
                <div className="taskboard__column-head">
                  <h2 id={`col-${col.id}`} className="taskboard__column-title">
                    {col.title}
                  </h2>
                  <span className="taskboard__column-count">
                    {(items[col.id] || []).length}
                  </span>
                </div>

                <div className="taskboard__column-body">
                  {columnIds.map((id, index) => {
                    const task = taskMap[id];
                    if (!task) return null;

                    const sortableIndex = filtering
                      ? index
                      : (items[col.id] || []).indexOf(id);

                    return (
                      <TaskCard
                        key={id}
                        id={id}
                        index={sortableIndex}
                        task={task}
                        categoryClass={categoryClass}
                        avatarUrl={avatarUrl}
                        formatDue={formatDue}
                        colId={col.id}
                        disabled={dragDisabled}
                      />
                    );
                  })}
                </div>

                <button
                  type="button"
                  className="taskboard__add"
                  onClick={() => openCreate(col.id)}
                >
                  <Plus size={16} />
                  Add Task
                </button>
              </Droppable>
            );
          })}
        </div>
      </DragDropProvider>

      <TaskModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        taskToEdit={null}
        onSave={handleSave}
        onLogout={onLogout}
      />
    </div>
  );
};

export default TaskBoard;
