import express from "express";

import authMiddleware from "../middleware/auth.js";
import {
  getBoardDetails,
  getTimer,
  updateBoardDetails,
} from "../controllers/boardController.js";

const boardRouter = express.Router();

boardRouter
  .route("/")
  .get(authMiddleware, getBoardDetails)
  .put(authMiddleware, updateBoardDetails);

boardRouter.route("/timer").get(authMiddleware, getTimer);

export default boardRouter;
