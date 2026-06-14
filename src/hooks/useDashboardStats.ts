import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, endOfWeek, format } from "date-fns";

interface DashboardStats {
  todayCalories: number;
  todayProtein: number;
  weeklyWorkoutCount: number;
  isLoading: boolean;
}

export const useDashboardStats = (userId: string): DashboardStats => {
  const [stats, setStats] = useState<DashboardStats>({
    todayCalories: 0,
    todayProtein: 0,
    weeklyWorkoutCount: 0,
    isLoading: true,
  });

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    (async () => {
      try {
        const now = new Date();
        const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");
        const weekEnd = format(endOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");
        const today = format(now, "yyyy-MM-dd");

        const [todayMealsRes, workoutsRes] = await Promise.all([
          supabase
            .from("meal_logs")
            .select("total_calories, total_protein")
            .eq("user_id", userId)
            .eq("meal_date", today),
          supabase
            .from("workout_logs")
            .select("id")
            .eq("user_id", userId)
            .gte("workout_date", weekStart)
            .lte("workout_date", weekEnd),
        ]);

        if (cancelled) return;

        const todayMeals = todayMealsRes.data || [];
        setStats({
          todayCalories: todayMeals.reduce((s, m) => s + (m.total_calories || 0), 0),
          todayProtein: todayMeals.reduce((s, m) => s + (m.total_protein || 0), 0),
          weeklyWorkoutCount: workoutsRes.data?.length || 0,
          isLoading: false,
        });
      } catch (error) {
        console.error("Error loading dashboard stats:", error);
        if (!cancelled) setStats((p) => ({ ...p, isLoading: false }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return stats;
};
