import { useEffect, useState } from "react";
import { getPlannerByDate } from "../utils/axios";
import { normalizePlannerResponse } from "../utils/planHelpers";

/**
 * Loads + normalizes a planner for a given YYYY-MM-DD date.
 * 404 is treated as an empty plan (not an error).
 */
export const usePlannerByDate = (date) => {
  const [plan, setPlan] = useState([]);
  const [focusMode, setFocusMode] = useState("balanced");
  const [hasGenerated, setHasGenerated] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const applyPlan = (data) => {
    const { plan: nextPlan, hasGenerated: nextHasGenerated } =
      normalizePlannerResponse(data);
    setPlan(nextPlan);
    setHasGenerated(nextHasGenerated);
  };

  const clearPlan = () => {
    setPlan([]);
    setHasGenerated(false);
    setError("");
  };

  const fetchPlanner = async (targetDate = date) => {
    if (!targetDate || !/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) return;

    setLoading(true);
    setError("");
    try {
      const { data } = await getPlannerByDate(targetDate);
      if (!data.success) {
        throw new Error(data.message || "Failed to load plan");
      }
      setFocusMode(data.plan?.focusMode || "balanced");
      applyPlan(data);
    } catch (err) {
      if (err.response?.status === 404) {
        clearPlan();
        return;
      }
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Could not load plan for this date.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanner(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch only when date changes
  }, [date]);

  return {
    focusMode,
    plan,
    setPlan,
    hasGenerated,
    setHasGenerated,
    error,
    setError,
    loading,
    fetchPlanner,
    applyPlan,
    clearPlan,
  };
};
