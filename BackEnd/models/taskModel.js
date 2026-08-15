import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "Low",
  },
  dueDate: {
    type: Date,
  },
  estimatedMinutes: {
    type: Number,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "inprogess", "overdue", "done"],
    default: "pending",
  },
  tags: {
    type: [String],
    default: [],
  },
  aiReason: {
    type: String,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const TaskModel = mongoose.model("Task", TaskSchema);

export default TaskModel;
