import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Home, Dumbbell, Utensils, Camera, User, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/workouts", label: "Workouts", icon: Dumbbell },
  { to: "/nutrition", label: "Nutrition", icon: Utensils },
  { to: "/photos", label: "Photos", icon: Camera },
  { to: "/profile", label: "Profile", icon: User },
];

export const DesktopNav = ({ onSignOut }: { onSignOut: () => void }) => {
  return (
    <header className="hidden md:block glass-card border-b border-border/40 sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between h-14">
            <NavLink to="/dashboard" className="flex items-center gap-2 shrink-0">
              <h1 className="text-lg font-bold shimmer-text">BoomStartAI</h1>
            </NavLink>
            <nav className="flex items-center gap-0.5">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-all duration-300"
                  activeClassName="text-primary bg-primary/10 hover:text-primary"
                >
                  <item.icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
            <div className="flex items-center gap-1 shrink-0">
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={onSignOut} className="text-muted-foreground hover:text-foreground">
                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                <span className="text-xs">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
