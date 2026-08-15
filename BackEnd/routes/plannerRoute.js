import express from "express";

import authMiddleware from "../middleware/auth.js";
import {
  generatePlanner,
  getAllPlanners,
  getPlanner,
} from "../controllers/plannerController.js";

const plannerRouter = express.Router();

plannerRouter.route("/generate").post(authMiddleware, generatePlanner);

plannerRouter.route("/all").get(authMiddleware, getAllPlanners);

plannerRouter.route("/:date").get(authMiddleware, getPlanner);

export default plannerRouter;
