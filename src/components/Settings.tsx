
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BasicSettings } from "@/components/settings/BasicSettings";
import { MailSettings } from "@/components/settings/MailSettings";
import { SchedulerPayrollSettings } from "@/components/settings/SchedulerPayrollSettings";
import { Settings as SettingsIcon, Mail, Calendar, Building } from "lucide-react";

export const Settings = () => {
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 md:h-8 md:w-8" />
          Settings
        </h1>
        <p className="text-gray-600 mt-2">
          Configure your application settings, mail configuration, and scheduler & payroll preferences
        </p>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span className="hidden sm:inline">Basic Settings</span>
            <span className="sm:hidden">Basic</span>
          </TabsTrigger>
          <TabsTrigger value="mail" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Mail Config</span>
            <span className="sm:hidden">Mail</span>
          </TabsTrigger>
          <TabsTrigger value="scheduler" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Scheduler & Payroll</span>
            <span className="sm:hidden">System</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic Application Settings</CardTitle>
              <CardDescription>
                Configure general application settings and company information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BasicSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mail">
          <Card>
            <CardHeader>
              <CardTitle>Mail Configuration</CardTitle>
              <CardDescription>
                Configure email settings for notifications and communications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MailSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduler">
          <Card>
            <CardHeader>
              <CardTitle>Scheduler & Payroll Settings</CardTitle>
              <CardDescription>
                Configure scheduling rules, payroll settings, and business policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SchedulerPayrollSettings />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
