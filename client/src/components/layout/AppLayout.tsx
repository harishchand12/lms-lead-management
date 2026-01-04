import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  KanbanSquare, 
  Settings, 
  Search, 
  Bell, 
  Menu,
  LogOut,
  UserCog,
  Briefcase,
  AlertCircle,
  Calendar,
  Loader2
} from "lucide-react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isBefore } from "date-fns";

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "agent";
  avatar: string | null;
}

interface Lead {
  id: number;
  name: string;
  company: string;
  nextFollowup: string | null;
  ownerId: number | null;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  
  const { data: currentUser } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
  });

  const { data: leads = [] } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      setLocation("/login");
    },
  });

  const navItems = useMemo(() => {
    const items = [
      { label: "Dashboard", icon: LayoutDashboard, href: "/" },
      { label: "Leads", icon: Users, href: "/leads" },
      { label: "Pipeline", icon: KanbanSquare, href: "/pipeline" },
    ];

    if (currentUser?.role === 'admin') {
      items.push({ label: "Agents", icon: UserCog, href: "/agents" });
    }

    items.push({ label: "Settings", icon: Settings, href: "/settings" });
    return items;
  }, [currentUser]);

  const notifications = useMemo(() => {
    if (!currentUser) return [];
    const today = new Date();
    const userLeads = currentUser.role === 'agent' 
      ? leads.filter(l => l.ownerId === currentUser.id)
      : leads;

    return userLeads
      .filter(l => l.nextFollowup && isBefore(new Date(l.nextFollowup), today))
      .map(l => ({
        id: l.id,
        title: "Overdue Follow-up",
        description: `${l.name} (${l.company})`,
        date: l.nextFollowup,
        isOverdue: true
      }));
  }, [currentUser, leads]);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const NavContent = () => (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2 font-heading font-bold text-xl tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            L
          </div>
          <span>Lead<span className="text-sidebar-muted font-normal opacity-70 text-sm ml-1">System</span></span>
        </div>
      </div>

      <div className="px-6 py-2 bg-primary/10 border-b border-sidebar-border/20 flex items-center gap-2">
        <Briefcase className="w-3 h-3 text-primary" />
        <span className="text-[10px] uppercase tracking-wider font-bold text-primary">
          {currentUser.role} View
        </span>
      </div>

      <div className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
              location === item.href 
                ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}>
              <item.icon className="w-4 h-4" />
              {item.label}
            </div>
          </Link>
        ))}
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 p-2 rounded-md hover:bg-sidebar-accent/50 transition-colors cursor-pointer group relative">
          <Avatar className="w-8 h-8 border border-sidebar-border">
            <AvatarImage src={`https://avatar.iran.liara.run/username?username=${currentUser.name}`} />
            <AvatarFallback>{currentUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{currentUser.name}</p>
            <p className="text-xs text-sidebar-foreground/60 truncate uppercase">{currentUser.role}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-sidebar-foreground/40">
                <Settings className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => logoutMutation.mutate()}
                className="text-destructive"
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4 mr-2" />
                )}
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="hidden md:block w-64 border-r border-border fixed inset-y-0 z-50">
        <NavContent />
      </aside>

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden -ml-2">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 border-r-0">
                <NavContent />
              </SheetContent>
            </Sheet>
            
            <div className="flex items-center gap-2">
               <h2 className="font-heading font-semibold text-lg hidden sm:block">
                {navItems.find(i => i.href === location)?.label || "Page"}
               </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden lg:block w-64 mr-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Quick search..." 
                className="pl-9 h-9 bg-muted/50 border-none focus-visible:ring-1"
              />
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground relative">
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-card"></span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                </div>
                <ScrollArea className="h-72">
                  {notifications.length > 0 ? (
                    <div className="grid">
                      {notifications.map((n) => (
                        <div key={n.id} className="p-4 border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer">
                          <div className="flex gap-3">
                            <div className="mt-1">
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-red-600">{n.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{n.description}</p>
                              <div className="flex items-center gap-1 mt-2 text-[10px] font-medium text-red-400">
                                <Calendar className="w-3 h-3" />
                                {n.date ? new Date(n.date).toLocaleDateString() : 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                      No new notifications
                    </div>
                  )}
                </ScrollArea>
              </PopoverContent>
            </Popover>

            <Avatar className="w-8 h-8 border border-border">
              <AvatarImage src={`https://avatar.iran.liara.run/username?username=${currentUser.name}`} />
              <AvatarFallback>{currentUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
