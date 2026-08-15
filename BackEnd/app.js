import express from "express";
import cors from "cors";
import userRouter from "./routes/userRoute.js";
import taskRouter from "./routes/taskRoute.js";
import plannerRouter from "./routes/plannerRoute.js";
import boardRouter from "./routes/dashboardRoute.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_, res) => {
  res.json({ ok: true });
});

// ROUTES
app.use("/api/user", userRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/planner", plannerRouter);
app.use("/api/board", boardRouter);

app.get("/", (req, res) => {
  res.send("API Working");
});

app.use(errorHandler);

export default app;
