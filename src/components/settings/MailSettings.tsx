
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Save, TestTube, Mail, AlertTriangle } from "lucide-react";

export const MailSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    provider: "smtp",
    smtpHost: "",
    smtpPort: "587",
    smtpUsername: "",
    smtpPassword: "",
    smtpSecurity: "tls",
    fromEmail: "",
    fromName: "",
    replyToEmail: "",
    
    // Notification Settings
    enableNotifications: true,
    sendWelcomeEmail: true,
    sendRosterNotifications: true,
    sendPayrollNotifications: true,
    sendReminderEmails: true,
    
    // Templates
    welcomeTemplate: "default",
    rosterTemplate: "default",
    payrollTemplate: "default",
  });

  const [testEmail, setTestEmail] = useState("");
  const [isTesting, setIsTesting] = useState(false);

  const handleSave = () => {
    toast({
      title: "Mail Settings Saved",
      description: "Email configuration has been updated successfully.",
    });
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: "Error",
        description: "Please enter a test email address.",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    // Simulate test email
    setTimeout(() => {
      setIsTesting(false);
      toast({
        title: "Test Email Sent",
        description: `Test email sent successfully to ${testEmail}`,
      });
    }, 2000);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Email Provider Configuration */}
      <div>
        <h3 className="text-lg font-medium mb-4">Email Provider Configuration</h3>
        
        <Alert className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Configure your email provider settings. For production use, we recommend using a dedicated email service like SendGrid, Mailgun, or AWS SES.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Email Provider</Label>
            <Select value={settings.provider} onValueChange={(value) => handleInputChange("provider", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="smtp">SMTP</SelectItem>
                <SelectItem value="sendgrid">SendGrid</SelectItem>
                <SelectItem value="mailgun">Mailgun</SelectItem>
                <SelectItem value="ses">AWS SES</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {settings.provider === "smtp" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <Input
                  id="smtpHost"
                  placeholder="smtp.gmail.com"
                  value={settings.smtpHost}
                  onChange={(e) => handleInputChange("smtpHost", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input
                  id="smtpPort"
                  placeholder="587"
                  value={settings.smtpPort}
                  onChange={(e) => handleInputChange("smtpPort", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpUsername">Username</Label>
                <Input
                  id="smtpUsername"
                  placeholder="your-email@gmail.com"
                  value={settings.smtpUsername}
                  onChange={(e) => handleInputChange("smtpUsername", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPassword">Password</Label>
                <Input
                  id="smtpPassword"
                  type="password"
                  placeholder="••••••••"
                  value={settings.smtpPassword}
                  onChange={(e) => handleInputChange("smtpPassword", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Security</Label>
                <Select value={settings.smtpSecurity} onValueChange={(value) => handleInputChange("smtpSecurity", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="tls">TLS</SelectItem>
                    <SelectItem value="ssl">SSL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Email Addresses */}
      <div>
        <h3 className="text-lg font-medium mb-4">Email Addresses</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fromEmail">From Email</Label>
            <Input
              id="fromEmail"
              type="email"
              placeholder="noreply@company.com"
              value={settings.fromEmail}
              onChange={(e) => handleInputChange("fromEmail", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fromName">From Name</Label>
            <Input
              id="fromName"
              placeholder="Schedule & Payroll System"
              value={settings.fromName}
              onChange={(e) => handleInputChange("fromName", e.target.value)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="replyToEmail">Reply-To Email</Label>
            <Input
              id="replyToEmail"
              type="email"
              placeholder="support@company.com"
              value={settings.replyToEmail}
              onChange={(e) => handleInputChange("replyToEmail", e.target.value)}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Notification Settings */}
      <div>
        <h3 className="text-lg font-medium mb-4">Notification Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Email Notifications</Label>
              <p className="text-sm text-gray-600">Master switch for all email notifications</p>
            </div>
            <Switch
              checked={settings.enableNotifications}
              onCheckedChange={(checked) => handleInputChange("enableNotifications", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Welcome Emails</Label>
              <p className="text-sm text-gray-600">Send welcome email to new users</p>
            </div>
            <Switch
              checked={settings.sendWelcomeEmail}
              onCheckedChange={(checked) => handleInputChange("sendWelcomeEmail", checked)}
              disabled={!settings.enableNotifications}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Roster Notifications</Label>
              <p className="text-sm text-gray-600">Notify employees about roster assignments</p>
            </div>
            <Switch
              checked={settings.sendRosterNotifications}
              onCheckedChange={(checked) => handleInputChange("sendRosterNotifications", checked)}
              disabled={!settings.enableNotifications}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Payroll Notifications</Label>
              <p className="text-sm text-gray-600">Notify employees about payroll updates</p>
            </div>
            <Switch
              checked={settings.sendPayrollNotifications}
              onCheckedChange={(checked) => handleInputChange("sendPayrollNotifications", checked)}
              disabled={!settings.enableNotifications}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Reminder Emails</Label>
              <p className="text-sm text-gray-600">Send reminder emails for upcoming shifts</p>
            </div>
            <Switch
              checked={settings.sendReminderEmails}
              onCheckedChange={(checked) => handleInputChange("sendReminderEmails", checked)}
              disabled={!settings.enableNotifications}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Test Email */}
      <div>
        <h3 className="text-lg font-medium mb-4">Test Email Configuration</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="test@example.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleTestEmail} 
            disabled={isTesting}
            variant="outline"
            className="flex items-center gap-2"
          >
            <TestTube className="h-4 w-4" />
            {isTesting ? "Sending..." : "Send Test Email"}
          </Button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Send a test email to verify your configuration is working correctly.
        </p>
      </div>

      <div className="flex justify-end pt-6">
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save Mail Settings
        </Button>
      </div>
    </div>
  );
};
