import { useState, useEffect } from "react";
import { useNavigate, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { OnboardingData } from "@/components/OnboardingForm";

// Pages
import DashboardPage from "@/pages/Dashboard";
import WorkoutsPage from "@/pages/Workouts";
import NutritionPage from "@/pages/Nutrition";
import ProgressPage from "@/pages/Progress";
import PhotosPage from "@/pages/Photos";
import ProfilePage from "@/pages/Profile";

export const AppRoutes = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, signOut } = useAuth();
  const [userData, setUserData] = useState<OnboardingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profile) {
          setUserData({
            weight: Number(profile.weight),
            height: Number(profile.height),
            age: profile.age,
            gender: profile.gender,
            goal: profile.goal as "bulk" | "cut" | "maintain",
            experience: profile.experience as
              | "beginner"
              | "intermediate"
              | "advanced",
            dietaryPreference: profile.dietary_preference,
            activityLevel: (profile.activity_level || "moderately_active") as OnboardingData["activityLevel"],
            workoutDaysPerWeek: profile.workout_days_per_week || 4,
          });
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      loadProfile();
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/");
  };

  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <MainLayout onSignOut={handleSignOut}>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </MainLayout>
    );
  }

  if (!userData) {
    return <Navigate to="/" replace />;
  }

  return (
    <MainLayout onSignOut={handleSignOut}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage userData={userData} userId={user!.id} />} />
        <Route path="/workouts" element={<WorkoutsPage userData={userData} userId={user!.id} />} />
        <Route path="/nutrition" element={<NutritionPage userData={userData} userId={user!.id} />} />
        <Route path="/progress" element={<ProgressPage userId={user!.id} />} />
        <Route path="/photos" element={<PhotosPage userId={user!.id} />} />
        <Route path="/profile" element={<ProfilePage userId={user!.id} />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </MainLayout>
  );
};
