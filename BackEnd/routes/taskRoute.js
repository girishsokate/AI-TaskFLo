import express from "express";
import {
  createTask,
  updateTask,
  getTaskById,
  getTasks,
  deleteTask,
  searchTask,
  updateTaskStatus,
} from "../controllers/taskController.js";
import authMiddleware from "../middleware/auth.js";

const taskRouter = express.Router();

taskRouter
  .route("/ct")
  .get(authMiddleware, getTasks)
  .post(authMiddleware, createTask);

taskRouter.route("/search-task").get(authMiddleware, searchTask);

taskRouter
  .route("/:id/ct")
  .get(authMiddleware, getTaskById)
  .put(authMiddleware, updateTask)
  .delete(authMiddleware, deleteTask);

taskRouter.route("/:id/ut").put(authMiddleware, updateTaskStatus);

export default taskRouter;
