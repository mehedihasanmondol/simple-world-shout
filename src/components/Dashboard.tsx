
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, Briefcase, Clock, DollarSign, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProfiles: 0,
    totalClients: 0,
    totalProjects: 0,
    pendingHours: 0,
    totalRevenue: 0,
    activeProjects: 0
  });

  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchRecentActivities();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch profiles count
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_active', true);

      // Fetch clients count
      const { data: clients } = await supabase
        .from('clients')
        .select('id')
        .eq('status', 'active');

      // Fetch projects count
      const { data: projects } = await supabase
        .from('projects')
        .select('id, status');

      // Fetch pending working hours
      const { data: pendingHours } = await supabase
        .from('working_hours')
        .select('total_hours')
        .eq('status', 'pending');

      // Calculate stats
      const totalPendingHours = pendingHours?.reduce((sum, h) => sum + h.total_hours, 0) || 0;
      const activeProjectsCount = projects?.filter(p => p.status === 'active').length || 0;

      setStats({
        totalProfiles: profiles?.length || 0,
        totalClients: clients?.length || 0,
        totalProjects: projects?.length || 0,
        pendingHours: totalPendingHours,
        totalRevenue: 125000, // Mock data
        activeProjects: activeProjectsCount
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const { data: recentHours } = await supabase
        .from('working_hours')
        .select(`
          *,
          profiles(full_name),
          projects(name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      const activities = recentHours?.map(h => ({
        id: h.id,
        description: `${h.profiles?.full_name || 'Unknown'} logged ${h.total_hours}h for ${h.projects?.name || 'Unknown Project'}`,
        time: new Date(h.created_at).toLocaleDateString(),
        status: h.status
      })) || [];

      setRecentActivities(activities);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    }
  };

  const dashboardStats = [
    { 
      title: "Total Profiles", 
      value: stats.totalProfiles.toString(), 
      icon: Users, 
      color: "text-blue-600",
      subtitle: "Active team members"
    },
    { 
      title: "Active Clients", 
      value: stats.totalClients.toString(), 
      icon: Building2, 
      color: "text-green-600",
      subtitle: "Current partnerships"
    },
    { 
      title: "Active Projects", 
      value: stats.activeProjects.toString(), 
      icon: Briefcase, 
      color: "text-purple-600",
      subtitle: "Ongoing work"
    },
    { 
      title: "Pending Hours", 
      value: `${stats.pendingHours}h`, 
      icon: Clock, 
      color: "text-orange-600",
      subtitle: "Awaiting approval"
    },
    { 
      title: "Revenue", 
      value: `$${stats.totalRevenue.toLocaleString()}`, 
      icon: DollarSign, 
      color: "text-emerald-600",
      subtitle: "This month"
    },
    { 
      title: "Total Projects", 
      value: stats.totalProjects.toString(), 
      icon: TrendingUp, 
      color: "text-indigo-600",
      subtitle: "All time"
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of your business operations</p>
        </div>
        <div className="text-sm text-gray-600">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className={`w-2 h-2 ${
                    activity.status === 'approved' ? 'bg-green-500' :
                    activity.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
                  } rounded-full`}></div>
                  <div className="flex-1">
                    <span className="text-sm">{activity.description}</span>
                    <div className="text-xs text-gray-500">{activity.time}</div>
                  </div>
                </div>
              ))}
              {recentActivities.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <div className="font-medium text-blue-800">Add New Client</div>
                <div className="text-sm text-blue-600">Create a new client profile</div>
              </button>
              <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <div className="font-medium text-green-800">Start New Project</div>
                <div className="text-sm text-green-600">Begin a new project for existing clients</div>
              </button>
              <button className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <div className="font-medium text-purple-800">Generate Report</div>
                <div className="text-sm text-purple-600">Create financial or activity reports</div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
