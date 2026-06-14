import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface WaterSleepStats {
  todayWater: number;
  waterGoal: number;
  isLoading: boolean;
  refresh: () => void;
}

export const useWaterSleepStats = (userId: string, userWeight: number): WaterSleepStats => {
  const [todayWater, setTodayWater] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const waterGoal = Math.round((userWeight || 70) * 35); // 35 ml per kg

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const { data } = await supabase
        .from("water_logs")
        .select("amount_ml")
        .eq("user_id", userId)
        .eq("log_date", today);
      setTodayWater((data || []).reduce((s, w) => s + (w.amount_ml || 0), 0));
    } catch (error) {
      console.error("Error loading water stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  return { todayWater, waterGoal, isLoading, refresh: load };
};
