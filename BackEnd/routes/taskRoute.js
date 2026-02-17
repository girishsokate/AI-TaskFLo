import express from 'express'
import{ createTask, updateTask, getTaskById, getTasks, deleteTask } from '../controllers/taskController.js'
import authMiddleware from "../middleware/auth.js";

const taskRouter = express.Router();

taskRouter.route("/ct")
.get(authMiddleware, getTasks)
.post(authMiddleware, createTask);

taskRouter.route('/:id/ct')
    .get(authMiddleware, getTaskById)
    .put(authMiddleware, updateTask)
    .delete(authMiddleware, deleteTask);

export default taskRouter;

