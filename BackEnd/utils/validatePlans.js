const validatePlans = (data) => {
  if (!data || typeof data !== "object") return false;
  if (!Array.isArray(data.tasks)) return false;

  return data.tasks.every((task) => {
    return (
      typeof task.title === "string" &&
      typeof task.priority === "string" &&
      ["high", "medium", "low"].includes(task.priority) &&
      typeof task.reason === "string" &&
      typeof task.estimatedMinutes === "number" &&
      typeof task.suggestedSlot === "string"
    );
  });
};

export default validatePlans;
