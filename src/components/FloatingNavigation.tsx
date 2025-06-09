
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  FolderOpen, 
  Clock, 
  Calendar,
  FileText, 
  Wallet,
  Bell,
  DollarSign,
  Shield,
  User,
  Calculator
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  hasPermission: (permission: string) => boolean;
}

export const FloatingNavigation = ({ activeTab, onTabChange, hasPermission }: FloatingNavigationProps) => {
  const menuItems = [
    { 
      id: "dashboard", 
      label: "Dashboard", 
      icon: LayoutDashboard,
      permission: "dashboard_view"
    },
    { 
      id: "personal-dashboard", 
      label: "My Dashboard", 
      icon: User,
      permission: null
    },
    { 
      id: "profiles", 
      label: "Profiles", 
      icon: Users,
      permission: "employees_view"
    },
    { 
      id: "working-hours", 
      label: "Hours", 
      icon: Clock,
      permission: "working_hours_view"
    },
    { 
      id: "payroll", 
      label: "Payroll", 
      icon: DollarSign,
      permission: "payroll_view"
    },
  ];

  // Filter and limit to most important items for mobile
  const visibleMenuItems = menuItems
    .filter(item => item.permission === null || hasPermission(item.permission))
    .slice(0, 5);

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 md:hidden">
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-full px-4 py-2 shadow-lg">
        <div className="flex items-center gap-1">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-[60px]",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs mt-1 truncate max-w-[50px]">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
