const parseSlot = (slot) => {
  if (!slot || typeof slot !== "string") return { start: "", end: "" };
  const parts = slot.split(/\s*[–\-—]\s*/);
  if (parts.length >= 2) {
    return { start: parts[0].trim(), end: parts[1].trim() };
  }
  return { start: slot.trim(), end: "" };
};

export const extractGeneratedTasks = (data) =>
  data?.plan?.generatedTasks || data?.tasks || data?.plan?.tasks || [];

export const mapGeneratedPlan = (generated) => {
  if (!Array.isArray(generated) || generated.length === 0) return [];

  return generated.map((t, i) => {
    const slot = parseSlot(t.suggestedSlot);
    return {
      id: t._id || t.id || i + 1,
      title: t.title,
      description: t.reason || t.description || t.aiReason || "",
      start: t.start || slot.start || "",
      end: t.end || slot.end || "",
      duration: t.estimatedMinutes || t.duration || 30,
      priority: t.priority
        ? t.priority.charAt(0).toUpperCase() + t.priority.slice(1)
        : "Medium",
    };
  });
};

/** Normalize planner API payload into UI plan state. */
export const normalizePlannerResponse = (data) => {
  const generated = extractGeneratedTasks(data);
  const plan = mapGeneratedPlan(generated);
  return {
    plan,
    hasGenerated: plan.length > 0,
  };
};

export const formatDateValue = (dateValue) => {
  if (!dateValue) return "Today";
  return new Date(`${dateValue}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
};
