import { Skeleton } from "@/components/ui/skeleton";
import { OnboardingData } from "@/components/OnboardingForm";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useWaterSleepStats } from "@/hooks/useWaterSleepStats";
import { QuickStatsGrid } from "@/components/dashboard/QuickStatsGrid";
import { WaterTracker } from "@/components/WaterTracker";
import TodayFocus from "@/components/TodayFocus";
import { RestDayToggle } from "@/components/RestDayToggle";
import { FutureMessage } from "@/components/FutureMessage";
import { TomorrowList } from "@/components/TomorrowList";
import { VisionBoard } from "@/components/VisionBoard";
import LifeCountdowns from "@/components/LifeCountdowns";
import { ErrorBoundary } from "@/components/ErrorBoundary";

interface DashboardPageProps {
  userData: OnboardingData;
  userId: string;
}

export const DashboardPage = ({ userData, userId }: DashboardPageProps) => {
  const stats = useDashboardStats(userId);
  const waterStats = useWaterSleepStats(userId, userData.weight);

  if (stats.isLoading || waterStats.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  // Calorie/protein math
  const bmr = userData.gender === "male"
    ? 88.362 + (13.397 * userData.weight) + (4.799 * userData.height) - (5.677 * userData.age)
    : 447.593 + (9.247 * userData.weight) + (3.098 * userData.height) - (4.330 * userData.age);
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2, lightly_active: 1.375, moderately_active: 1.55,
    very_active: 1.725, extra_active: 1.9,
  };
  const tdee = Math.round(bmr * (activityMultipliers[userData.activityLevel] || 1.55));
  const calorieGoal = userData.goal === "cut" ? tdee - 500 : userData.goal === "bulk" ? tdee + 300 : tdee;
  const proteinGoal = Math.round(userData.weight * 1.8);

  const quickStats = [
    { label: "Calories", value: stats.todayCalories, unit: `/ ${calorieGoal}`, icon: "flame" as const, color: "primary" as const },
    { label: "Protein", value: stats.todayProtein, unit: `/ ${proteinGoal}g`, icon: "protein" as const, color: "accent" as const },
    { label: "Water", value: waterStats.todayWater, unit: `/ ${waterStats.waterGoal}ml`, icon: "water" as const, color: "blue" as const },
    { label: "Workouts", value: stats.weeklyWorkoutCount, unit: "this week", icon: "target" as const, color: "secondary" as const },
  ];

  return (
    <div className="space-y-5">
      <ErrorBoundary>
        <TodayFocus
          userId={userId}
          todayCalories={stats.todayCalories}
          todayProtein={stats.todayProtein}
          calorieGoal={calorieGoal}
          proteinGoal={proteinGoal}
          todayWater={waterStats.todayWater}
          waterGoal={waterStats.waterGoal}
        />
      </ErrorBoundary>

      <ErrorBoundary>
        <QuickStatsGrid stats={quickStats} />
      </ErrorBoundary>

      <div className="flex justify-end">
        <ErrorBoundary>
          <RestDayToggle userId={userId} />
        </ErrorBoundary>
      </div>

      <ErrorBoundary>
        <WaterTracker
          userId={userId}
          todayTotal={waterStats.todayWater}
          dailyGoal={waterStats.waterGoal}
          onLog={waterStats.refresh}
        />
      </ErrorBoundary>

      <ErrorBoundary>
        <LifeCountdowns />
      </ErrorBoundary>

      <div className="grid md:grid-cols-2 gap-4">
        <ErrorBoundary>
          <FutureMessage userId={userId} />
        </ErrorBoundary>
        <ErrorBoundary>
          <TomorrowList userId={userId} />
        </ErrorBoundary>
      </div>

      <ErrorBoundary>
        <VisionBoard userId={userId} />
      </ErrorBoundary>
    </div>
  );
};

export default DashboardPage;
