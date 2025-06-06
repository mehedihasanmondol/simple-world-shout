
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { TrendingUp, Users, DollarSign, Download, Calendar, Filter } from "lucide-react";
import { Payroll, BulkPayroll, SalaryTemplate } from "@/types/database";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";

interface SalaryReportsProps {
  payrolls: Payroll[];
  bulkPayrolls: BulkPayroll[];
  templates: SalaryTemplate[];
}

export const SalaryReports = ({ payrolls, bulkPayrolls, templates }: SalaryReportsProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [showFilters, setShowFilters] = useState(false);

  const years = useMemo(() => {
    const yearSet = new Set<number>();
    payrolls.forEach(p => {
      yearSet.add(new Date(p.pay_period_start).getFullYear());
    });
    return Array.from(yearSet).sort((a, b) => b - a);
  }, [payrolls]);

  const payrollByMonth = useMemo(() => {
    const monthlyData = new Array(12).fill(0).map((_, index) => ({
      month: new Date(0, index).toLocaleString('default', { month: 'short' }),
      amount: 0,
      count: 0
    }));

    payrolls
      .filter(p => new Date(p.pay_period_start).getFullYear().toString() === selectedYear)
      .forEach(payroll => {
        const month = new Date(payroll.pay_period_start).getMonth();
        monthlyData[month].amount += payroll.net_pay;
        monthlyData[month].count += 1;
      });

    return monthlyData;
  }, [payrolls, selectedYear]);

  const statusDistribution = useMemo(() => {
    const statusCount = { pending: 0, approved: 0, paid: 0 };
    payrolls.forEach(p => {
      statusCount[p.status as keyof typeof statusCount] += 1;
    });

    return [
      { name: 'Pending', value: statusCount.pending, color: '#f59e0b' },
      { name: 'Approved', value: statusCount.approved, color: '#3b82f6' },
      { name: 'Paid', value: statusCount.paid, color: '#10b981' }
    ];
  }, [payrolls]);

  const topEmployees = useMemo(() => {
    const employeeData: Record<string, { name: string; total: number; hours: number }> = {};
    
    payrolls.forEach(p => {
      const key = p.profile_id;
      const name = p.profiles?.full_name || 'Unknown';
      
      if (!employeeData[key]) {
        employeeData[key] = { name, total: 0, hours: 0 };
      }
      
      employeeData[key].total += p.net_pay;
      employeeData[key].hours += p.total_hours;
    });

    return Object.values(employeeData)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [payrolls]);

  const FiltersContent = () => (
    <div className="space-y-4">
      <div>
        <Label>Time Period</Label>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Year</Label>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map(year => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg sm:text-xl">Salary Reports & Analytics</CardTitle>
            
            <div className="flex gap-2">
              {/* Mobile Filters */}
              <div className="sm:hidden">
                <Sheet open={showFilters} onOpenChange={setShowFilters}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-72">
                    <div className="mt-6">
                      <FiltersContent />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Desktop Filters */}
              <div className="hidden sm:flex gap-2">
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Payroll</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  ${payrolls.reduce((sum, p) => sum + p.net_pay, 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Employees</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">
                  {new Set(payrolls.map(p => p.profile_id)).size}
                </p>
              </div>
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Monthly</p>
                <p className="text-xl sm:text-2xl font-bold text-purple-600">
                  ${(payrollByMonth.reduce((sum, m) => sum + m.amount, 0) / 12).toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bulk Operations</p>
                <p className="text-xl sm:text-2xl font-bold text-orange-600">
                  {bulkPayrolls.length}
                </p>
              </div>
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Monthly Payroll Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Payroll Trend ({selectedYear})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={payrollByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    fontSize={12}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis 
                    fontSize={12}
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']}
                  />
                  <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payroll Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }) => `${name}: ${value}`}
                    labelStyle={{ fontSize: 12 }}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Employees */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Employees by Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topEmployees.map((employee, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{employee.name}</p>
                    <p className="text-sm text-gray-600">{employee.hours.toFixed(1)} hours</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">${employee.total.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Total earnings</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
