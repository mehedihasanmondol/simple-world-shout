
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, Users, DollarSign, Calendar, Zap, FileText, Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Payroll, BulkPayroll, SalaryTemplate, Profile } from "@/types/database";
import { useToast } from "@/hooks/use-toast";
import { PayrollManagement } from "./PayrollManagement";
import { BulkSalaryProcessor } from "./BulkSalaryProcessor";
import { SalaryTemplateManagement } from "./SalaryTemplateManagement";
import { SalaryReports } from "./SalaryReports";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const SalarySystemDashboard = () => {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [bulkPayrolls, setBulkPayrolls] = useState<BulkPayroll[]>([]);
  const [templates, setTemplates] = useState<SalaryTemplate[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("payroll");
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [payrollsRes, bulkPayrollsRes, templatesRes, profilesRes] = await Promise.all([
        supabase.from('payroll').select(`
          *,
          profiles!payroll_profile_id_fkey (id, full_name, email, role, avatar_url, is_active, phone, employment_type, hourly_rate, salary, tax_file_number, start_date, created_at, updated_at),
          bank_accounts (id, bank_name, account_number)
        `).order('created_at', { ascending: false }),
        
        supabase.from('bulk_payroll').select(`
          *,
          profiles!bulk_payroll_created_by_fkey (id, full_name, email, role, avatar_url, is_active, phone, employment_type, hourly_rate, salary, tax_file_number, start_date, created_at, updated_at)
        `).order('created_at', { ascending: false }),
        
        supabase.from('salary_templates').select(`
          *,
          profiles (id, full_name, email, role, avatar_url, is_active, phone, employment_type, hourly_rate, salary, tax_file_number, start_date, created_at, updated_at),
          clients (id, name, email, phone, company, status, created_at, updated_at),
          projects (id, name, description, client_id, status, start_date, end_date, budget, created_at, updated_at),
          bank_accounts (id, profile_id, bank_name, account_number, bsb_code, swift_code, account_holder_name, opening_balance, is_primary, created_at, updated_at)
        `).order('created_at', { ascending: false }),
        
        supabase.from('profiles').select('*').eq('is_active', true).order('full_name')
      ]);

      if (payrollsRes.error) throw payrollsRes.error;
      if (bulkPayrollsRes.error) throw bulkPayrollsRes.error;
      if (templatesRes.error) throw templatesRes.error;
      if (profilesRes.error) throw profilesRes.error;

      setPayrolls(payrollsRes.data as Payroll[]);
      setBulkPayrolls(bulkPayrollsRes.data as BulkPayroll[]);
      setTemplates(templatesRes.data as SalaryTemplate[]);
      setProfiles(profilesRes.data as Profile[]);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch salary data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const totalPayroll = payrolls.reduce((sum, p) => sum + p.net_pay, 0);
  const totalHours = payrolls.reduce((sum, p) => sum + p.total_hours, 0);
  const activeTemplates = templates.filter(t => t.is_active).length;

  const TabContent = () => (
    <>
      <TabsContent value="payroll" className="space-y-4">
        <PayrollManagement 
          payrolls={payrolls}
          profiles={profiles}
          onRefresh={fetchData}
        />
      </TabsContent>

      <TabsContent value="bulk" className="space-y-4">
        <BulkSalaryProcessor 
          bulkPayrolls={bulkPayrolls}
          profiles={profiles}
          onRefresh={fetchData}
        />
      </TabsContent>

      <TabsContent value="templates" className="space-y-4">
        <SalaryTemplateManagement 
          templates={templates}
          profiles={profiles}
          onRefresh={fetchData}
        />
      </TabsContent>

      <TabsContent value="reports" className="space-y-4">
        <SalaryReports 
          payrolls={payrolls}
          bulkPayrolls={bulkPayrolls}
          templates={templates}
        />
      </TabsContent>
    </>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-sm text-gray-600">Loading salary dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Calculator className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
              Salary Management
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Comprehensive payroll and salary management
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 truncate">
              Total Payroll
            </CardTitle>
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 truncate">
              ${totalPayroll.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Net pay amount</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 truncate">
              Total Hours
            </CardTitle>
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">
              {totalHours.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Hours worked</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 truncate">
              Bulk Operations
            </CardTitle>
            <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 flex-shrink-0" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">
              {bulkPayrolls.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Bulk batches</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 truncate">
              Templates
            </CardTitle>
            <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600 flex-shrink-0" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600">
              {activeTemplates}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Active templates</p>
          </CardContent>
        </Card>
      </div>

      {/* Desktop Tabs */}
      <div className="hidden sm:block">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto">
            <TabsTrigger 
              value="payroll" 
              className="text-xs sm:text-sm px-2 py-2 sm:px-4 sm:py-3"
            >
              Individual Payroll
            </TabsTrigger>
            <TabsTrigger 
              value="bulk" 
              className="text-xs sm:text-sm px-2 py-2 sm:px-4 sm:py-3"
            >
              Bulk Operations
            </TabsTrigger>
            <TabsTrigger 
              value="templates" 
              className="text-xs sm:text-sm px-2 py-2 sm:px-4 sm:py-3"
            >
              Templates
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              className="text-xs sm:text-sm px-2 py-2 sm:px-4 sm:py-3"
            >
              Reports
            </TabsTrigger>
          </TabsList>

          <TabContent />
        </Tabs>
      </div>

      {/* Mobile Navigation */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {activeTab === "payroll" && "Individual Payroll"}
            {activeTab === "bulk" && "Bulk Operations"}
            {activeTab === "templates" && "Templates"}
            {activeTab === "reports" && "Reports"}
          </h2>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Menu className="h-4 w-4 mr-2" />
                Menu
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="space-y-2 mt-6">
                <Button
                  variant={activeTab === "payroll" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("payroll")}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Individual Payroll
                </Button>
                <Button
                  variant={activeTab === "bulk" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("bulk")}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Bulk Operations
                </Button>
                <Button
                  variant={activeTab === "templates" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("templates")}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Templates
                </Button>
                <Button
                  variant={activeTab === "reports" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("reports")}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Reports
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabContent />
        </Tabs>
      </div>
    </div>
  );
};
