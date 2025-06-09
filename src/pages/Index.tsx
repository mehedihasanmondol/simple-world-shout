
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/Sidebar";
import { UserMenu } from "@/components/UserMenu";
import { FloatingNavigation } from "@/components/FloatingNavigation";
import { RoleDashboardRouter } from "@/components/RoleDashboardRouter";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

const Index = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isMobile = useIsMobile();

  const hasPermission = (permission: string) => {
    if (!profile) return false;
    
    const permissions = {
      admin: ["dashboard_view", "employees_view", "employees_manage", "clients_view", "projects_view", "working_hours_view", "roster_view", "payroll_view", "notifications_view", "reports_view", "bank_balance_view"],
      accountant: ["dashboard_view", "employees_view", "payroll_view", "reports_view", "bank_balance_view"],
      operation: ["dashboard_view", "employees_view", "clients_view", "projects_view", "working_hours_view", "roster_view"],
      sales_manager: ["dashboard_view", "clients_view", "projects_view", "reports_view"],
      employee: ["working_hours_view", "roster_view", "notifications_view"]
    };
    
    return permissions[profile.role as keyof typeof permissions]?.includes(permission) || false;
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (isMobile) {
      setMobileNavOpen(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Layout */}
      {!isMobile && (
        <>
          <Sidebar 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
            hasPermission={hasPermission}
            onCollapsedChange={setSidebarCollapsed}
          />
          
          {/* Main Content */}
          <div 
            className={`transition-all duration-300 ${
              sidebarCollapsed ? 'ml-16' : 'ml-64'
            }`}
          >
            {/* Top Header */}
            <header className="bg-background border-b border-border px-6 py-4">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-foreground capitalize">
                  {activeTab.replace('-', ' ')}
                </h1>
                <UserMenu />
              </div>
            </header>

            {/* Page Content */}
            <main className="p-6 bg-background min-h-[calc(100vh-73px)]">
              <RoleDashboardRouter activeTab={activeTab} />
            </main>
          </div>
        </>
      )}

      {/* Mobile Layout */}
      {isMobile && (
        <>
          {/* Mobile Header */}
          <header className="bg-background border-b border-border px-4 py-3 flex justify-between items-center sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                  <Sidebar 
                    activeTab={activeTab} 
                    onTabChange={handleTabChange} 
                    hasPermission={hasPermission}
                    isMobile={true}
                  />
                </SheetContent>
              </Sheet>
              
              <h1 className="text-lg font-bold text-foreground capitalize">
                {activeTab.replace('-', ' ')}
              </h1>
            </div>
            
            <UserMenu />
          </header>

          {/* Mobile Content */}
          <main className="p-4 bg-background min-h-[calc(100vh-65px)]">
            <RoleDashboardRouter activeTab={activeTab} />
          </main>

          {/* Bottom Navigation */}
          <FloatingNavigation 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
            hasPermission={hasPermission}
          />
        </>
      )}
    </div>
  );
};

export default Index;
