import { useState, useMemo, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import * as XLSX from "xlsx";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, MoreHorizontal, Calendar, FileDown, Upload, Flame, Thermometer, Snowflake, Info, Loader2, Pencil, Trash2, ArrowUp, ArrowDown, AlertTriangle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { format, isSameDay, addDays, subDays, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";

interface Lead {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string | null;
  status: string;
  temperature: string;
  value: number;
  nextFollowup: string | null;
  followupNote: string | null;
  ownerId: number | null;
  createdAt: string | null;
}

interface Agent {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "agent";
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  contacted: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  qualified: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  proposal: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  negotiation: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  closed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

export default function LeadsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [followupFilter, setFollowupFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [followupSortOrder, setFollowupSortOrder] = useState<"asc" | "desc">("asc");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: currentUser } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
  });

  const { data: allLeads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const { data: agents = [] } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
  });

  const createLeadMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/leads", data);
      if (!res.ok) throw new Error("Failed to create lead");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      setIsAddModalOpen(false);
      toast.success("Lead created successfully");
    },
    onError: () => {
      toast.error("Failed to create lead");
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PUT", `/api/leads/${id}`, data);
      if (!res.ok) throw new Error("Failed to update lead");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/dashboard"] });
      setLeadToEdit(null);
      toast.success("Lead updated successfully");
    },
    onError: () => {
      toast.error("Failed to update lead");
    },
  });

  const deleteLeadMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/leads/${id}`);
      if (!res.ok) throw new Error("Failed to delete lead");
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/dashboard"] });
      toast.success("Lead deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete lead");
    },
  });

  const leads = useMemo(() => {
    let filtered = allLeads;
    if (currentUser?.role === 'agent') {
      filtered = allLeads.filter(l => l.ownerId === currentUser.id);
    }

    const filteredLeads = filtered.filter(lead => {
      const matchesSearch = 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        lead.company.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      
      let matchesFollowup = true;
      const today = startOfDay(new Date());
      const leadDate = lead.nextFollowup ? startOfDay(new Date(lead.nextFollowup)) : null;

      if (followupFilter === "today") {
        matchesFollowup = leadDate ? isSameDay(leadDate, today) : false;
      } else if (followupFilter === "tomorrow") {
        matchesFollowup = leadDate ? isSameDay(leadDate, addDays(today, 1)) : false;
      } else if (followupFilter === "yesterday") {
        matchesFollowup = leadDate ? isSameDay(leadDate, subDays(today, 1)) : false;
      } else if (followupFilter === "date" && selectedDate) {
        matchesFollowup = leadDate ? isSameDay(leadDate, startOfDay(selectedDate)) : false;
      }
      
      return matchesSearch && matchesStatus && matchesFollowup;
    });

    // Sort by next follow-up date (null dates always at end)
    return filteredLeads.sort((a, b) => {
      if (!a.nextFollowup && !b.nextFollowup) return 0;
      if (!a.nextFollowup) return 1;
      if (!b.nextFollowup) return -1;
      const diff = new Date(a.nextFollowup).getTime() - new Date(b.nextFollowup).getTime();
      return followupSortOrder === "asc" ? diff : -diff;
    });
  }, [searchTerm, statusFilter, followupFilter, selectedDate, currentUser, allLeads, followupSortOrder]);

  const overdueCount = useMemo(() => {
    const today = startOfDay(new Date());
    let filteredLeads = allLeads;
    if (currentUser?.role === 'agent') {
      filteredLeads = allLeads.filter(l => l.ownerId === currentUser.id);
    }
    return filteredLeads.filter(lead => {
      if (!lead.nextFollowup) return false;
      const followupDate = startOfDay(new Date(lead.nextFollowup));
      return followupDate < today;
    }).length;
  }, [allLeads, currentUser]);

  const handleAddLead = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createLeadMutation.mutate({
      name: formData.get("fullname"),
      company: formData.get("company"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      temperature: formData.get("temperature") || "warm",
      value: Number(formData.get("value")) || 0,
      nextFollowup: formData.get("next-followup") || null,
      followupNote: formData.get("notes") || null,
      ownerId: Number(formData.get("agent")) || currentUser?.id,
    });
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      let successCount = 0;
      let errorCount = 0;

      for (const row of jsonData) {
        try {
          const agentEmail = row.AgentEmail || row.agentEmail || '';
          const matchedAgent = agents.find(a => a.email.toLowerCase() === agentEmail.toLowerCase());
          
          const nextFollowupStr = row.NextFollowup || row.nextFollowup || row['Next Followup'] || '';
          let nextFollowup = null;
          if (nextFollowupStr) {
            const parsedDate = new Date(nextFollowupStr);
            if (!isNaN(parsedDate.getTime())) {
              nextFollowup = parsedDate.toISOString();
            }
          }

          const status = (row.Status || row.status || 'new').toLowerCase();
          const validStatuses = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed', 'lost'];
          
          const leadData = {
            name: row.Name || row.name || '',
            company: row.Company || row.company || '',
            email: row.Email || row.email || '',
            phone: row.Phone || row.phone || null,
            alternatePhone: row.AlternatePhone || row.alternatePhone || row['Alternate Phone'] || null,
            temperature: (row.Temperature || row.temperature || 'warm').toLowerCase(),
            status: validStatuses.includes(status) ? status : 'new',
            value: Number(row.Value || row.value) || 0,
            nextFollowup: nextFollowup,
            followupNote: row.Notes || row.notes || null,
            ownerId: matchedAgent?.id || currentUser?.id,
          };

          if (leadData.name && leadData.company && leadData.email) {
            await createLeadMutation.mutateAsync(leadData);
            successCount++;
          } else {
            errorCount++;
          }
        } catch {
          errorCount++;
        }
      }

      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/dashboard"] });
      
      if (successCount > 0) {
        toast.success(`Imported ${successCount} leads successfully`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to import ${errorCount} rows`);
      }
    } catch (error) {
      toast.error("Failed to read file");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const downloadSampleTemplate = () => {
    const sampleData = [
      { 
        Name: 'John Doe', 
        Company: 'Acme Corp', 
        Email: 'john@acme.com', 
        Phone: '+91 9876543210', 
        AlternatePhone: '+91 9876543211',
        Temperature: 'hot', 
        Status: 'new',
        Value: 500000, 
        AgentEmail: 'agent@example.com',
        NextFollowup: '2025-01-15 10:00',
        Notes: 'Interested in enterprise plan' 
      },
      { 
        Name: 'Jane Smith', 
        Company: 'Tech Solutions', 
        Email: 'jane@techsol.com', 
        Phone: '+91 8765432109', 
        AlternatePhone: '',
        Temperature: 'warm', 
        Status: 'contacted',
        Value: 250000, 
        AgentEmail: '',
        NextFollowup: '2025-01-20 14:30',
        Notes: 'Follow up next week' 
      },
    ];
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    XLSX.writeFile(wb, "leads_import_template.xlsx");
    toast.success("Sample template downloaded");
  };

  const getTempIcon = (temp: string) => {
    switch (temp) {
      case 'hot': return <Flame className="h-3.5 w-3.5 text-orange-600" />;
      case 'warm': return <Thermometer className="h-3.5 w-3.5 text-amber-600" />;
      case 'cold': return <Snowflake className="h-3.5 w-3.5 text-blue-600" />;
      default: return null;
    }
  };

  const getTempColor = (temp: string) => {
    switch (temp) {
      case 'hot': return "bg-orange-50 text-orange-700 border-orange-100";
      case 'warm': return "bg-amber-50 text-amber-700 border-amber-100";
      case 'cold': return "bg-blue-50 text-blue-700 border-blue-100";
      default: return "";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {currentUser?.role === 'agent' ? "My Leads" : "All Leads"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {currentUser?.role === 'agent' 
                ? `Manage your assigned opportunities and follow-ups.` 
                : "Track all company leads and pipeline status."}
            </p>
          </div>
          {overdueCount > 0 && (
            <div 
              className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md"
              data-testid="overdue-followup-indicator"
            >
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <div>
                <span className="text-sm font-semibold text-red-700 dark:text-red-300">
                  {overdueCount} Overdue
                </span>
                <span className="text-xs text-red-600 dark:text-red-400 ml-1">
                  Follow-up{overdueCount > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" className="gap-2" onClick={downloadSampleTemplate} data-testid="button-download-template">
            <FileDown className="h-4 w-4" />
            Template
          </Button>
          <input 
            type="file" 
            ref={fileInputRef}
            accept=".xlsx,.xls"
            onChange={handleFileImport}
            className="hidden"
            data-testid="input-import-file"
          />
          <Button 
            variant="outline" 
            className="gap-2" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            data-testid="button-import"
          >
            {isImporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Import
              </>
            )}
          </Button>

          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">Add New Lead</DialogTitle>
                <DialogDescription>
                  Enter the details of the new prospective client.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddLead} className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullname">Full Name</Label>
                    <Input id="fullname" name="fullname" placeholder="e.g. Rahul Sharma" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input id="company" name="company" placeholder="e.g. India Solutions Ltd" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="agent">Assign to Agent</Label>
                    <Select name="agent" defaultValue={String(currentUser?.id)}>
                      <SelectTrigger id="agent">
                        <SelectValue placeholder="Select Agent" />
                      </SelectTrigger>
                      <SelectContent>
                        {agents.map(a => (
                          <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Lead Temperature</Label>
                    <RadioGroup name="temperature" defaultValue="warm" className="flex h-11 bg-muted/30 rounded-md p-1 items-center">
                      <div className="flex-1 flex items-center justify-center">
                        <RadioGroupItem value="hot" id="hot" className="peer sr-only" />
                        <Label htmlFor="hot" className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm cursor-pointer text-xs font-medium transition-all peer-data-[state=checked]:bg-white peer-data-[state=checked]:shadow-sm peer-data-[state=checked]:text-orange-600">
                          Hot
                        </Label>
                      </div>
                      <div className="flex-1 flex items-center justify-center">
                        <RadioGroupItem value="warm" id="warm" className="peer sr-only" />
                        <Label htmlFor="warm" className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm cursor-pointer text-xs font-medium transition-all peer-data-[state=checked]:bg-white peer-data-[state=checked]:shadow-sm peer-data-[state=checked]:text-amber-600">
                          Warm
                        </Label>
                      </div>
                      <div className="flex-1 flex items-center justify-center">
                        <RadioGroupItem value="cold" id="cold" className="peer sr-only" />
                        <Label htmlFor="cold" className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm cursor-pointer text-xs font-medium transition-all peer-data-[state=checked]:bg-white peer-data-[state=checked]:shadow-sm peer-data-[state=checked]:text-blue-600">
                          Cold
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" placeholder="+91 00000 00000" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alternate">Alternate Number</Label>
                    <Input id="alternate" name="alternate" placeholder="Secondary contact" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" name="email" type="email" placeholder="rahul@example.in" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="next-followup">Next Follow-up Call</Label>
                    <Input id="next-followup" name="next-followup" type="datetime-local" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="value">Estimated Value</Label>
                    <Input id="value" name="value" type="number" defaultValue="0" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Initial Project Notes</Label>
                  <Textarea id="notes" name="notes" placeholder="Provide context about requirements..." className="min-h-[100px]" />
                </div>

                <DialogFooter>
                  <Button type="submit" className="w-full" disabled={createLeadMutation.isPending}>
                    {createLeadMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : "Save Lead"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-center bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search name or company..." 
            className="pl-9 bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <Select value={followupFilter} onValueChange={setFollowupFilter}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Follow-up" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Follow-ups</SelectItem>
              <SelectItem value="today">Today's Follow-up</SelectItem>
              <SelectItem value="tomorrow">Tomorrow</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="date">Select Date</SelectItem>
            </SelectContent>
          </Select>

          {followupFilter === "date" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
              </PopoverContent>
            </Popover>
          )}

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="proposal">Proposal</SelectItem>
              <SelectItem value="negotiation">Negotiation</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Temp</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>
                <button 
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                  onClick={() => setFollowupSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                  data-testid="button-sort-followup"
                >
                  Next Follow-up
                  {followupSortOrder === "asc" ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : (
                    <ArrowDown className="h-4 w-4" />
                  )}
                </button>
              </TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Calendar className="h-8 w-8 opacity-20" />
                    <p>No leads found matching your criteria.</p>
                    <Button variant="link" onClick={() => setFollowupFilter("all")}>
                      View all leads
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => {
                const owner = agents.find(a => a.id === lead.ownerId);
                
                return (
                  <TableRow key={lead.id} className="hover:bg-muted/30 transition-colors h-20">
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="text-base font-semibold leading-tight">{lead.name}</span>
                        <span className="text-sm text-muted-foreground font-normal">{lead.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{lead.company}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("gap-1.5 px-2 py-0.5 font-medium text-[10px] uppercase tracking-wider border", getTempColor(lead.temperature))}>
                        {getTempIcon(lead.temperature)}
                        {lead.temperature}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`font-medium px-2.5 py-0.5 border-none shadow-none text-xs rounded-md ${statusColors[lead.status]}`}>
                        {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">{formatCurrency(lead.value)}</TableCell>
                    <TableCell>
                      {lead.createdAt ? (
                        <span className="text-sm text-muted-foreground">{format(new Date(lead.createdAt), "MMM d, yyyy")}</span>
                      ) : (
                        <span className="text-muted-foreground text-xs italic">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {lead.nextFollowup ? (() => {
                        const followupDate = startOfDay(new Date(lead.nextFollowup));
                        const today = startOfDay(new Date());
                        const isPastDue = followupDate < today;
                        const isToday = isSameDay(followupDate, today);
                        const colorClass = isPastDue ? "text-red-600 dark:text-red-400" : isToday ? "text-orange-600 dark:text-orange-400" : "text-muted-foreground";
                        return (
                          <div className={cn("flex items-center gap-2", colorClass)}>
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm font-medium">{format(new Date(lead.nextFollowup), "MMM d, yyyy")}</span>
                          </div>
                        );
                      })() : (
                        <span className="text-muted-foreground text-xs italic">Not scheduled</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {lead.followupNote || <span className="italic">No notes</span>}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="w-7 h-7 border shadow-sm">
                          <AvatarImage src={`https://avatar.iran.liara.run/username?username=${owner?.name}`} />
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                            {owner?.name?.split(' ').map(n => n[0]).join('') || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{owner?.name || 'Unassigned'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground"
                            data-testid={`button-lead-menu-${lead.id}`}
                          >
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => setLeadToEdit(lead)}
                            data-testid={`button-edit-lead-${lead.id}`}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => setLeadToDelete(lead)}
                            data-testid={`button-delete-lead-${lead.id}`}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!leadToDelete} onOpenChange={(open) => !open && setLeadToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lead</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {leadToDelete?.name} from {leadToDelete?.company}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (leadToDelete) {
                  deleteLeadMutation.mutate(leadToDelete.id);
                  setLeadToDelete(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!leadToEdit} onOpenChange={(open) => !open && setLeadToEdit(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
            <DialogDescription>Update lead information.</DialogDescription>
          </DialogHeader>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (!leadToEdit) return;
              const formData = new FormData(e.currentTarget);
              updateLeadMutation.mutate({
                id: leadToEdit.id,
                data: {
                  name: formData.get("fullname"),
                  company: formData.get("company"),
                  email: formData.get("email"),
                  phone: formData.get("phone"),
                  temperature: formData.get("temperature") || "warm",
                  value: Number(formData.get("value")) || 0,
                  nextFollowup: formData.get("next-followup") || null,
                  followupNote: formData.get("notes") || null,
                  status: formData.get("status") || leadToEdit.status,
                },
              });
            }} 
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-fullname">Full Name</Label>
                <Input id="edit-fullname" name="fullname" defaultValue={leadToEdit?.name} required data-testid="input-edit-fullname" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-company">Company</Label>
                <Input id="edit-company" name="company" defaultValue={leadToEdit?.company} required data-testid="input-edit-company" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email Address</Label>
                <Input id="edit-email" name="email" type="email" defaultValue={leadToEdit?.email} required data-testid="input-edit-email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input id="edit-phone" name="phone" defaultValue={leadToEdit?.phone || ""} data-testid="input-edit-phone" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Lead Temperature</Label>
                <RadioGroup defaultValue={leadToEdit?.temperature || "warm"} name="temperature" className="flex gap-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hot" id="edit-hot" />
                    <Label htmlFor="edit-hot" className="text-orange-500 cursor-pointer">Hot</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="warm" id="edit-warm" />
                    <Label htmlFor="edit-warm" className="text-yellow-500 cursor-pointer">Warm</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cold" id="edit-cold" />
                    <Label htmlFor="edit-cold" className="text-blue-500 cursor-pointer">Cold</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select name="status" defaultValue={leadToEdit?.status || "new"}>
                  <SelectTrigger data-testid="select-edit-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-next-followup">Next Follow-up</Label>
                <Input 
                  id="edit-next-followup" 
                  name="next-followup" 
                  type="datetime-local" 
                  defaultValue={leadToEdit?.nextFollowup ? new Date(leadToEdit.nextFollowup).toISOString().slice(0, 16) : ""}
                  data-testid="input-edit-next-followup" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-value">Estimated Value</Label>
                <Input id="edit-value" name="value" type="number" defaultValue={leadToEdit?.value} data-testid="input-edit-value" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea id="edit-notes" name="notes" defaultValue={leadToEdit?.followupNote || ""} data-testid="input-edit-notes" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setLeadToEdit(null)}>Cancel</Button>
              <Button type="submit" disabled={updateLeadMutation.isPending} data-testid="button-save-edit">
                {updateLeadMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
