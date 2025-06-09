
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Save, Clock, DollarSign, Calendar, Info } from "lucide-react";

export const SchedulerPayrollSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    // Scheduling Settings
    workingDaysPerWeek: "5",
    standardWorkingHours: "8",
    startOfWeek: "monday",
    shiftReminder: "24", // hours before
    autoApproveShifts: false,
    allowSelfScheduling: true,
    maximumAdvanceScheduling: "30", // days
    minimumNoticeScheduling: "24", // hours
    
    // Time Tracking
    enableTimeTracking: true,
    requireSignInOut: true,
    allowMobileSignIn: true,
    gpsTracking: false,
    breakTime: "30", // minutes
    automaticBreaks: false,
    
    // Overtime Settings
    overtimeThreshold: "40", // hours per week
    overtimeMultiplier: "1.5",
    doubleTimeThreshold: "60", // hours per week
    doubleTimeMultiplier: "2.0",
    weeklyOvertimeCalculation: true,
    
    // Payroll Settings
    payrollFrequency: "bi-weekly",
    payDayOfWeek: "friday",
    payrollCutoffDay: "sunday",
    defaultHourlyRate: "25.00",
    minimumWage: "15.00",
    automaticPayrollGeneration: false,
    
    // Leave & Holidays
    annualLeaveEntitlement: "20", // days
    sickLeaveEntitlement: "10", // days
    publicHolidayPay: true,
    leaveApprovalRequired: true,
    
    // Compliance
    taxDeductionRate: "20", // percentage
    superannuationRate: "11", // percentage
    workersCompensation: true,
    minimumShiftLength: "3", // hours
    maximumShiftLength: "12", // hours
    restBetweenShifts: "10", // hours
    
    // Notifications
    reminderNotifications: true,
    approvalNotifications: true,
    payrollNotifications: true,
    overdueTimesheetReminders: true,
  });

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Scheduler & Payroll settings have been updated successfully.",
    });
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Scheduling Settings */}
      <div>
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Scheduling Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Working Days Per Week</Label>
            <Select value={settings.workingDaysPerWeek} onValueChange={(value) => handleInputChange("workingDaysPerWeek", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 Days</SelectItem>
                <SelectItem value="6">6 Days</SelectItem>
                <SelectItem value="7">7 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Standard Working Hours</Label>
            <Input
              value={settings.standardWorkingHours}
              onChange={(e) => handleInputChange("standardWorkingHours", e.target.value)}
              placeholder="8"
            />
          </div>
          <div className="space-y-2">
            <Label>Start of Week</Label>
            <Select value={settings.startOfWeek} onValueChange={(value) => handleInputChange("startOfWeek", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sunday">Sunday</SelectItem>
                <SelectItem value="monday">Monday</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Shift Reminder (Hours Before)</Label>
            <Input
              value={settings.shiftReminder}
              onChange={(e) => handleInputChange("shiftReminder", e.target.value)}
              placeholder="24"
            />
          </div>
          <div className="space-y-2">
            <Label>Max Advance Scheduling (Days)</Label>
            <Input
              value={settings.maximumAdvanceScheduling}
              onChange={(e) => handleInputChange("maximumAdvanceScheduling", e.target.value)}
              placeholder="30"
            />
          </div>
          <div className="space-y-2">
            <Label>Min Notice Required (Hours)</Label>
            <Input
              value={settings.minimumNoticeScheduling}
              onChange={(e) => handleInputChange("minimumNoticeScheduling", e.target.value)}
              placeholder="24"
            />
          </div>
        </div>
        
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-Approve Shifts</Label>
              <p className="text-sm text-gray-600">Automatically approve scheduled shifts</p>
            </div>
            <Switch
              checked={settings.autoApproveShifts}
              onCheckedChange={(checked) => handleInputChange("autoApproveShifts", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Self-Scheduling</Label>
              <p className="text-sm text-gray-600">Let employees schedule their own shifts</p>
            </div>
            <Switch
              checked={settings.allowSelfScheduling}
              onCheckedChange={(checked) => handleInputChange("allowSelfScheduling", checked)}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Time Tracking */}
      <div>
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Time Tracking
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Break Time (Minutes)</Label>
            <Input
              value={settings.breakTime}
              onChange={(e) => handleInputChange("breakTime", e.target.value)}
              placeholder="30"
            />
          </div>
          <div className="space-y-2">
            <Label>Rest Between Shifts (Hours)</Label>
            <Input
              value={settings.restBetweenShifts}
              onChange={(e) => handleInputChange("restBetweenShifts", e.target.value)}
              placeholder="10"
            />
          </div>
          <div className="space-y-2">
            <Label>Minimum Shift Length (Hours)</Label>
            <Input
              value={settings.minimumShiftLength}
              onChange={(e) => handleInputChange("minimumShiftLength", e.target.value)}
              placeholder="3"
            />
          </div>
          <div className="space-y-2">
            <Label>Maximum Shift Length (Hours)</Label>
            <Input
              value={settings.maximumShiftLength}
              onChange={(e) => handleInputChange("maximumShiftLength", e.target.value)}
              placeholder="12"
            />
          </div>
        </div>
        
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Time Tracking</Label>
              <p className="text-sm text-gray-600">Track actual working hours</p>
            </div>
            <Switch
              checked={settings.enableTimeTracking}
              onCheckedChange={(checked) => handleInputChange("enableTimeTracking", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Sign In/Out</Label>
              <p className="text-sm text-gray-600">Employees must sign in and out</p>
            </div>
            <Switch
              checked={settings.requireSignInOut}
              onCheckedChange={(checked) => handleInputChange("requireSignInOut", checked)}
              disabled={!settings.enableTimeTracking}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Mobile Sign In</Label>
              <p className="text-sm text-gray-600">Enable mobile app sign in/out</p>
            </div>
            <Switch
              checked={settings.allowMobileSignIn}
              onCheckedChange={(checked) => handleInputChange("allowMobileSignIn", checked)}
              disabled={!settings.enableTimeTracking}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>GPS Tracking</Label>
              <p className="text-sm text-gray-600">Track location during sign in/out</p>
            </div>
            <Switch
              checked={settings.gpsTracking}
              onCheckedChange={(checked) => handleInputChange("gpsTracking", checked)}
              disabled={!settings.enableTimeTracking}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Automatic Breaks</Label>
              <p className="text-sm text-gray-600">Automatically deduct break time</p>
            </div>
            <Switch
              checked={settings.automaticBreaks}
              onCheckedChange={(checked) => handleInputChange("automaticBreaks", checked)}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Overtime & Payroll */}
      <div>
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Overtime & Payroll
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Overtime Threshold (Hours/Week)</Label>
            <Input
              value={settings.overtimeThreshold}
              onChange={(e) => handleInputChange("overtimeThreshold", e.target.value)}
              placeholder="40"
            />
          </div>
          <div className="space-y-2">
            <Label>Overtime Multiplier</Label>
            <Input
              value={settings.overtimeMultiplier}
              onChange={(e) => handleInputChange("overtimeMultiplier", e.target.value)}
              placeholder="1.5"
            />
          </div>
          <div className="space-y-2">
            <Label>Double Time Threshold</Label>
            <Input
              value={settings.doubleTimeThreshold}
              onChange={(e) => handleInputChange("doubleTimeThreshold", e.target.value)}
              placeholder="60"
            />
          </div>
          <div className="space-y-2">
            <Label>Default Hourly Rate</Label>
            <Input
              value={settings.defaultHourlyRate}
              onChange={(e) => handleInputChange("defaultHourlyRate", e.target.value)}
              placeholder="25.00"
            />
          </div>
          <div className="space-y-2">
            <Label>Minimum Wage</Label>
            <Input
              value={settings.minimumWage}
              onChange={(e) => handleInputChange("minimumWage", e.target.value)}
              placeholder="15.00"
            />
          </div>
          <div className="space-y-2">
            <Label>Payroll Frequency</Label>
            <Select value={settings.payrollFrequency} onValueChange={(value) => handleInputChange("payrollFrequency", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tax Deduction Rate (%)</Label>
            <Input
              value={settings.taxDeductionRate}
              onChange={(e) => handleInputChange("taxDeductionRate", e.target.value)}
              placeholder="20"
            />
          </div>
          <div className="space-y-2">
            <Label>Superannuation Rate (%)</Label>
            <Input
              value={settings.superannuationRate}
              onChange={(e) => handleInputChange("superannuationRate", e.target.value)}
              placeholder="11"
            />
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Weekly Overtime Calculation</Label>
              <p className="text-sm text-gray-600">Calculate overtime on weekly basis</p>
            </div>
            <Switch
              checked={settings.weeklyOvertimeCalculation}
              onCheckedChange={(checked) => handleInputChange("weeklyOvertimeCalculation", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Automatic Payroll Generation</Label>
              <p className="text-sm text-gray-600">Auto-generate payroll at end of period</p>
            </div>
            <Switch
              checked={settings.automaticPayrollGeneration}
              onCheckedChange={(checked) => handleInputChange("automaticPayrollGeneration", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Public Holiday Pay</Label>
              <p className="text-sm text-gray-600">Automatic pay for public holidays</p>
            </div>
            <Switch
              checked={settings.publicHolidayPay}
              onCheckedChange={(checked) => handleInputChange("publicHolidayPay", checked)}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Leave Management */}
      <div>
        <h3 className="text-lg font-medium mb-4">Leave Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Annual Leave Entitlement (Days)</Label>
            <Input
              value={settings.annualLeaveEntitlement}
              onChange={(e) => handleInputChange("annualLeaveEntitlement", e.target.value)}
              placeholder="20"
            />
          </div>
          <div className="space-y-2">
            <Label>Sick Leave Entitlement (Days)</Label>
            <Input
              value={settings.sickLeaveEntitlement}
              onChange={(e) => handleInputChange("sickLeaveEntitlement", e.target.value)}
              placeholder="10"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Leave Approval Required</Label>
              <p className="text-sm text-gray-600">Require manager approval for leave requests</p>
            </div>
            <Switch
              checked={settings.leaveApprovalRequired}
              onCheckedChange={(checked) => handleInputChange("leaveApprovalRequired", checked)}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Compliance Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          These settings affect payroll calculations and compliance. Please consult with your HR department or legal advisor 
          to ensure settings comply with local employment laws and regulations.
        </AlertDescription>
      </Alert>

      <div className="flex justify-end pt-6">
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};
