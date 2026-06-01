import { NavLink } from "@/components/NavLink";
import { Home, Dumbbell, Utensils, Camera, User } from "lucide-react";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/workouts", label: "Workouts", icon: Dumbbell },
  { to: "/nutrition", label: "Nutrition", icon: Utensils },
  { to: "/photos", label: "Photos", icon: Camera },
  { to: "/profile", label: "Profile", icon: User },
];

export const MobileNav = () => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-card border-t border-border/40 z-50 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex flex-col items-center justify-center gap-1 w-full h-full text-muted-foreground transition-all duration-300"
            activeClassName="text-primary [&>svg]:drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]"
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
