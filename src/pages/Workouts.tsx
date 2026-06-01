import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkoutPlan } from "@/components/WorkoutPlan";
import { WorkoutLogger } from "@/components/WorkoutLogger";
import { OnboardingData } from "@/components/OnboardingForm";
import { Dumbbell, ClipboardList } from "lucide-react";

interface WorkoutsPageProps {
  userData: OnboardingData;
  userId: string;
}

export const WorkoutsPage = ({ userData, userId }: WorkoutsPageProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Workouts</h2>
        <p className="text-muted-foreground">
          Your personalized workout plan and logging.
        </p>
      </div>

      <Tabs defaultValue="plan" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="plan" className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4" />
            <span className="hidden sm:inline">Plan</span>
          </TabsTrigger>
          <TabsTrigger value="log" className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            <span className="hidden sm:inline">Log</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plan">
          <WorkoutPlan userData={userData} userId={userId} />
        </TabsContent>

        <TabsContent value="log">
          <WorkoutLogger userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkoutsPage;
