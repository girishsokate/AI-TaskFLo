import mongoose from "mongoose";

const PlannerSchema = new mongoose.Schema({
  date: { type: String, default: Date.now() },
  goal: { type: String, default: "" },
  availableHours: { type: Number, required: true },
  focusMode: {
    type: String,
    enum: ["balanced", "deep-work", "light"],
    default: "balanced",
  },
  taskCount: { type: Number, default: 2 },
  generatedTasks: [
    {
      title: String,
      priority: String,
      aiReason: String,
      estimatedMinutes: Number,
      suggestedSlot: String,
    },
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const PlannerModel = mongoose.model("Planner", PlannerSchema);

export default PlannerModel;
