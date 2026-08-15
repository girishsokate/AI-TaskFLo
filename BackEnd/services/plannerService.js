import { openai } from "../config/openai.js";

export const generateDailyPlan = async ({
  goal,
  date,
  availableHours,
  focusMode,
  taskCount,
}) => {
  const response = await openai.responses.create({
    model: "gpt-5.4-mini",
    input: `
You are a daily planner assistant.
Generate a prioritized daily plan from the user input.

User input:
- Goal: ${goal}
- Date: ${date}
- Available hours: ${availableHours}
- Focus mode: ${focusMode}
- Task count: ${taskCount}

Return only structured JSON matching the schema.
`,
    text: {
      format: {
        type: "json_schema",
        name: "daily_plan",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            tasks: {
              type: "array",
              minItems: 1,
              maxItems: 12,
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  title: { type: "string" },
                  priority: {
                    type: "string",
                    enum: ["high", "medium", "low"],
                  },
                  reason: { type: "string" },
                  estimatedMinutes: { type: "number" },
                  suggestedSlot: { type: "string" },
                },
                required: [
                  "title",
                  "priority",
                  "reason",
                  "estimatedMinutes",
                  "suggestedSlot",
                ],
              },
            },
          },
          required: ["tasks"],
        },
      },
    },
  });

  return JSON.parse(response.output_text);
};
