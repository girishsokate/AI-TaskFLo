// components/TaskModal.jsx
import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  X,
  Save,
  Calendar,
  AlignLeft,
  Flag,
  CheckCircle,
  Tag,
} from "lucide-react";
import { priorityStyles, DEFAULT_TASK } from "../assets/dummy";
import { createTask, updateTask } from "../utils/axios";

const MAX_TAGS = 8;

const normalizeTags = (tags) =>
  [
    ...new Set(
      (Array.isArray(tags) ? tags : [])
        .map((t) => String(t).trim())
        .filter(Boolean),
    ),
  ].slice(0, MAX_TAGS);

const TaskModal = ({ isOpen, onClose, taskToEdit, onSave, onLogout }) => {
  const [taskData, setTaskData] = useState(DEFAULT_TASK);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!isOpen) return;
    if (taskToEdit) {
      const normalized =
        taskToEdit.completed === "Yes" || taskToEdit.completed === true
          ? "Yes"
          : "No";
      setTaskData({
        ...DEFAULT_TASK,
        title: taskToEdit.title || "",
        description: taskToEdit.description || "",
        priority: taskToEdit.priority || "low",
        dueDate: taskToEdit.dueDate?.split("T")[0] || "",
        completed: normalized,
        tags: normalizeTags(taskToEdit.tags),
        id: taskToEdit._id || taskToEdit.id || null,
      });
    } else {
      setTaskData(DEFAULT_TASK);
    }
    setTagInput("");
    setError(null);
  }, [isOpen, taskToEdit]);

  const addTagsFromValue = (raw) => {
    const parts = String(raw)
      .split(/[,]+/)
      .map((t) => t.trim())
      .filter(Boolean);
    if (!parts.length) return;

    setTaskData((prev) => ({
      ...prev,
      tags: normalizeTags([...(prev.tags || []), ...parts]),
    }));
    setTagInput("");
  };

  const removeTag = (tag) => {
    setTaskData((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((t) => t !== tag),
    }));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTagsFromValue(tagInput);
      return;
    }
    if (e.key === "Backspace" && !tagInput && taskData.tags?.length) {
      removeTag(taskData.tags[taskData.tags.length - 1]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (taskData.dueDate < today) {
      setError("Due date cannot be in the past.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const pendingTags = tagInput.trim()
        ? normalizeTags([...(taskData.tags || []), tagInput])
        : normalizeTags(taskData.tags);

      const payload = {
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        dueDate: taskData.dueDate,
        completed: taskData.completed,
        tags: pendingTags,
      };

      const isEdit = Boolean(taskData.id);
      const { data } = isEdit
        ? await updateTask(taskData.id, payload)
        : await createTask(payload);

      const saved = data?.task || data;
      onSave?.(saved);
      onClose();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) return onLogout?.();
      setError(
        err.response?.data?.message ||
          err.message ||
          "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-purple-100 rounded-xl max-w-md w-full shadow-lg p-6 relative animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            {taskData.id ? (
              <Save className="text-purple-500 w-5 h-5" />
            ) : (
              <PlusCircle className="text-purple-500 w-5 h-5" />
            )}
            {taskData.id ? "Edit Task" : "Create New Task"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-purple-100 rounded-lg transition-colors text-gray-500 hover:text-purple-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="form-stack">
          {error && (
            <div
              className="form-message form-message--error"
              style={{ marginBottom: 0 }}
            >
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="task-title">
              Task Title
            </label>
            <div className="input-field">
              <input
                id="task-title"
                type="text"
                name="title"
                required
                value={taskData.title}
                onChange={handleChange}
                className="input-field__control"
                placeholder="Enter task title"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-description">
              <AlignLeft size={14} /> Description
            </label>
            <div className="textarea-field">
              <textarea
                id="task-description"
                name="description"
                rows="3"
                value={taskData.description}
                onChange={handleChange}
                className="textarea-field__control"
                placeholder="Add details about your task"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-tags">
              <Tag size={14} /> Tags
            </label>
            <div className="tag-field">
              {(taskData.tags || []).map((tag) => (
                <span key={tag} className="tag-field__chip">
                  <span className="tag-field__chip-text">{tag}</span>
                  <button
                    type="button"
                    className="tag-field__chip-remove"
                    aria-label={`Remove ${tag}`}
                    onClick={() => removeTag(tag)}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              <input
                id="task-tags"
                type="text"
                className="tag-field__input"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => {
                  if (tagInput.trim()) addTagsFromValue(tagInput);
                }}
                placeholder={
                  (taskData.tags || []).length
                    ? "Add another…"
                    : "Type a tag and press Enter"
                }
                disabled={(taskData.tags || []).length >= MAX_TAGS}
              />
            </div>
            <p className="form-hint">
              Press Enter or comma to add. Up to {MAX_TAGS} tags.
            </p>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="task-priority">
                <Flag size={14} /> Priority
              </label>
              <div
                className={`input-field ${priorityStyles[taskData.priority] || ""}`}
              >
                <select
                  id="task-priority"
                  name="priority"
                  value={taskData.priority}
                  onChange={handleChange}
                  className="input-field__control"
                >
                  <option value={"low"}>Low</option>
                  <option value={"medium"}>Medium</option>
                  <option value={"high"}>High</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="task-due">
                <Calendar size={14} /> Due Date
              </label>
              <div className="input-field">
                <span className="input-field__icon">
                  <Calendar size={16} />
                </span>
                <input
                  id="task-due"
                  type="date"
                  name="dueDate"
                  required
                  min={today}
                  value={taskData.dueDate}
                  onChange={handleChange}
                  className="input-field__control"
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <span className="form-label">
              <CheckCircle size={14} /> Status
            </span>
            <div className="form-check-row">
              {[
                { val: "Yes", label: "Completed" },
                { val: "No", label: "In Progress" },
              ].map(({ val, label }) => (
                <label key={val} className="form-check">
                  <input
                    type="radio"
                    name="completed"
                    value={val}
                    checked={taskData.completed === val}
                    onChange={handleChange}
                    className="form-check__input"
                  />
                  <span className="form-check__label">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn--primary btn--block"
          >
            {loading ? (
              "Saving..."
            ) : taskData.id ? (
              <>
                <Save className="w-4 h-4" /> Update Task
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" /> Create Task
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
