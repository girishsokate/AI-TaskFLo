import validatePlans from "../utils/validatePlans.js";
import Task from "../models/taskModel.js";
import Planner from "../models/plannerModel.js";
import { generateDailyPlan } from "../services/plannerService.js";

export const generatePlanner = async (req, res) => {
  try {
    const { goal, date, availableHours, focusMode, taskCount } = req.body;
    const plan = await generateDailyPlan({
      goal,
      date,
      availableHours,
      focusMode,
      taskCount,
    });
    console.log(plan);
    if (!validatePlans(plan)) {
      return res.status(500).json({ message: "Invalid plan returned by AI" });
    }
    console.log(plan.tasks);
    const savedTasks = await Task.insertMany(
      plan.tasks.map((t) => ({
        title: t.title,
        priority: t.priority,
        dueDate: String(date).slice(0, 10),
        estimatedMinutes: t.estimatedMinutes,
        status: "pending",
        owner: req.user.id,
        tags: ["ai-generated"],
        completed: false,
        aiReason: t.reason,
      })),
    );

    const savedPlan = await Planner.create({
      goal,
      date: String(date).slice(0, 10),
      availableHours,
      focusMode,
      taskCount,
      owner: req.user.id,
      generatedTasks: plan.tasks.map((t) => ({
        title: t.title,
        priority: t.priority,
        dueDate: String(date).slice(0, 10),
        aiReason: t.reason || t.aiReason || "",
        estimatedMinutes: t.estimatedMinutes,
        suggestedSlot: t.suggestedSlot || "",
      })),
    });

    return res.status(201).json({
      success: true,
      plan: savedPlan,
      tasks: savedTasks,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllPlanners = async (req, res) => {
  try {
    const plans = await Planner.find({ owner: req.user.id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, plans });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPlanner = async (req, res) => {
  try {
    const rawDate = req.params.date;

    if (!rawDate) {
      return res
        .status(400)
        .json({ success: false, message: "Date is required" });
    }

    const date = decodeURIComponent(rawDate).slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    const plan = await Planner.findOne({
      owner: req.user.id,
      date,
    }).sort({ createdAt: -1 });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "No plan found for this date",
        plan: null,
      });
    }

    return res.status(200).json({ success: true, plan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
