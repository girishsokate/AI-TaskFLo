import { Calendar, CheckCircle2 } from "lucide-react";
import { useSortable } from "@dnd-kit/react/sortable";
import {
  getPriorityColor,
  getPriorityBadgeColor,
  TI_CLASSES,
} from "../assets/dummy";

const TaskCard = ({
  id,
  index,
  task,
  categoryClass,
  avatarUrl,
  formatDue,
  colId,
  disabled = false,
}) => {
  const { ref, isDragging } = useSortable({
    id,
    index,
    type: "item",
    accept: "item",
    group: colId,
    disabled,
  });

  const borderColor = getPriorityColor(task.priority);

  return (
    <article
      ref={ref}
      className={`board-card${isDragging ? " is-dragging" : ""} ${borderColor}`}
      role="listitem"
      data-dragging={isDragging || undefined}
    >
      <h3 className="board-card__title">
        {task.title}{" "}
        <span
          className={`${TI_CLASSES.priorityBadge} ${getPriorityBadgeColor(task.priority)}`}
        >
          {task.priority}
        </span>
      </h3>
      <span className={`board-tag ${categoryClass(task.category)}`}>
        {task.category}
      </span>
      <div className="board-card__footer">
        <img
          src={avatarUrl(task.assignee)}
          alt=""
          className="board-card__avatar"
          title={task.assignee}
        />
        {colId === "done" ? (
          <span className="board-card__done" aria-label="Done">
            <CheckCircle2 size={16} strokeWidth={2} />
          </span>
        ) : (
          <span className="board-card__due">
            <Calendar size={13} strokeWidth={1.75} />
            {formatDue(task.dueDate) || "No date"}
          </span>
        )}
      </div>
    </article>
  );
};

export default TaskCard;
