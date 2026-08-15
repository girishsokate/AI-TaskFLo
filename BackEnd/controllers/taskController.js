import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import Task from "../models/taskModel.js";

// CREATE A TASK
export const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      dueDate,
      estimatedMinutes,
      status,
      tags,
      completed,
      aiReason,
    } = req.body;

    const task = new Task({
      title,
      description,
      priority,
      dueDate,
      estimatedMinutes,
      owner: req.user.id,
      status,
      tags: Array.isArray(tags)
        ? [
            ...new Set(
              tags.map((t) => String(t).trim()).filter(Boolean),
            ),
          ]
        : [],
      completed: completed === "Yes" || completed === true,
      aiReason,
    });

    const saved = await task.save();
    res.status(201).json({ success: true, task: saved });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET ALL TASKS
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ owner: req.user.id })
      .populate("owner", "name email")
      .sort({
        createdAt: -1,
      });
    res.status(200).json({ success: true, tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

//GET TASKS BY ID (MUST BELONG TO CURRENT USER)
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user.id });
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task Not Found" });
    }
    res.status(201).json({ success: true, task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE A TASK BY ID
export const updateTask = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.completed !== undefined) {
      if (typeof data.completed === "string") {
        data.completed = data.completed.toLowerCase() === "yes";
      } else {
        data.completed = data.completed === true;
      }
    }
    if (Array.isArray(data.tags)) {
      data.tags = [
        ...new Set(
          data.tags
            .map((t) => String(t).trim())
            .filter(Boolean),
        ),
      ];
    }
    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      data,
      { runValidators: true, returnDocument: "after" },
    );
    if (!updatedTask) {
      return res.status(404).json({ status: false, message: "Task not found" });
    }
    res.json({ success: true, task: updatedTask });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE A TASK STATUS (board column)
export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res
        .status(400)
        .json({ success: false, message: "Status is required" });
    }

    // Map Task Board column ids → persisted status values
    const STATUS_MAP = {
      todo: "pending",
      pending: "pending",
      inprogress: "inprogess",
      overdue: "overdue",
      done: "done",
    };

    const updatedStatus = STATUS_MAP[status];
    if (!updatedStatus) {
      return res.status(400).json({
        success: false,
        message: `Invalid status "${status}". Allowed: ${Object.keys(STATUS_MAP).join(", ")}`,
      });
    }

    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      {
        $set: {
          status: updatedStatus,
          completed: updatedStatus === "done",
        },
      },
      { runValidators: true, new: true },
    );

    if (!updatedTask) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    res.status(200).json({ success: true, task: updatedTask });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE TASK BY ID
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
    });
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }
    res.status(200).json({ success: true, task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const searchTask = async (req, res) => {};
