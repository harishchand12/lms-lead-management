import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis, 
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { Users, DollarSign, Target, Activity, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

interface Lead {
  id: number;
  name: string;
  company: string;
  email: string;
  status: string;
  value: number;
  ownerId: number | null;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "agent";
}

interface DashboardStats {
  totalPipelineValue: number;
  activeLeadsCount: number;
  winRate: number;
  avgDealSize: number;
  statusDistribution: { status: string; count: number }[];
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  contacted: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  qualified: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  proposal: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  negotiation: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  closed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

const statusPieColors: Record<string, string> = {
  new: '#3b82f6',
  contacted: '#6366f1',
  qualified: '#a855f7',
  proposal: '#f59e0b',
  negotiation: '#f97316',
  closed: '#22c55e',
};

const chartData = [
  { month: "Jan", revenue: 1200000 },
  { month: "Feb", revenue: 1900000 },
  { month: "Mar", revenue: 1500000 },
  { month: "Apr", revenue: 2400000 },
  { month: "May", revenue: 3200000 },
  { month: "Jun", revenue: 4500000 },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

export default function Dashboard() {
  const { data: currentUser } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/stats/dashboard"],
  });

  const { data: leads = [], isLoading: leadsLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const userLeads = currentUser?.role === 'admin' 
    ? leads 
    : leads.filter(l => l.ownerId === currentUser?.id);

  const pieData = stats?.statusDistribution.map(s => ({
    name: s.status.charAt(0).toUpperCase() + s.status.slice(1),
    value: s.count,
    color: statusPieColors[s.status] || '#888',
  })) || [];

  if (statsLoading || leadsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {currentUser?.role === 'admin' ? "Admin Dashboard" : "My Dashboard"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {currentUser?.role === 'admin' ? "Overview of company performance." : "Your personal performance overview."}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.totalPipelineValue || 0)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeLeadsCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.winRate || 0}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Deal Size</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.avgDealSize || 0)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Revenue Forecast</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/100000).toFixed(0)}L`} />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/.1)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Pipeline Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userLeads.slice(0, 5).map((lead) => (
              <div key={lead.id} className="flex items-center justify-between gap-4 p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">{lead.name.charAt(0)}</div>
                  <div>
                    <h3 className="font-medium text-sm">{lead.name}</h3>
                    <p className="text-xs text-muted-foreground">{lead.company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <p className="text-sm font-medium">{formatCurrency(lead.value)}</p>
                  <Badge variant="secondary" className={statusColors[lead.status]}>{lead.status}</Badge>
                </div>
              </div>
            ))}
            {userLeads.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No leads found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
