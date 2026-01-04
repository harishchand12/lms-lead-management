import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects, 
  DropAnimation
} from "@dnd-kit/core";
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Plus, MoreHorizontal, GripVertical, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

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

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

interface SortableLeadCardProps {
  lead: Lead;
  agents: Agent[];
  onDelete: (lead: Lead) => void;
}

function SortableLeadCard({ lead, agents, onDelete }: SortableLeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: lead.id, data: { type: 'Lead', lead } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const owner = agents.find(a => a.id === lead.ownerId);

  if (isDragging) {
    return (
      <div 
        ref={setNodeRef} 
        style={style} 
        className="opacity-30 bg-muted/50 border-2 border-primary border-dashed rounded-lg h-[120px]"
      />
    );
  }

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group"
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center gap-2">
            <div {...attributes} {...listeners} className="text-muted-foreground/50 hover:text-foreground cursor-grab">
              <GripVertical className="h-4 w-4" />
            </div>
            <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">
              {lead.company}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 -mr-1 opacity-0 group-hover:opacity-100 transition-opacity"
                data-testid={`button-lead-menu-${lead.id}`}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(lead)}
                data-testid={`button-delete-lead-${lead.id}`}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div>
          <h4 className="font-semibold text-sm leading-tight">{lead.name}</h4>
          <p className="text-xs text-muted-foreground mt-1">{formatCurrency(lead.value)}</p>
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span>{lead.nextFollowup ? new Date(lead.nextFollowup).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No date'}</span>
          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
            {owner?.name.split(' ').map(n => n[0]).join('') || '?'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const COLUMNS = [
  { id: 'new', title: 'New Leads' },
  { id: 'contacted', title: 'Contacted' },
  { id: 'qualified', title: 'Qualified' },
  { id: 'proposal', title: 'Proposal' },
  { id: 'negotiation', title: 'Negotiation' },
  { id: 'closed', title: 'Closed' },
];

export default function PipelinePage() {
  const { data: currentUser } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
  });

  const { data: allLeads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const { data: agents = [] } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/leads/${id}/status`, { status });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
    },
    onError: () => {
      toast.error("Failed to move lead");
    },
  });

  const deleteMutation = useMutation({
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
    if (currentUser?.role === 'admin') return allLeads;
    return allLeads.filter(l => l.ownerId === currentUser?.id);
  }, [allLeads, currentUser]);

  const [activeId, setActiveId] = useState<number | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as number;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveALead = active.data.current?.type === 'Lead';
    const isOverALead = over.data.current?.type === 'Lead';

    if (!isActiveALead) return;

    const isOverAColumn = COLUMNS.some(col => col.id === overId);

    if (isActiveALead && isOverAColumn) {
      const activeLead = leads.find(l => l.id === activeId);
      if (activeLead && activeLead.status !== overId) {
        updateStatusMutation.mutate({ id: activeId, status: overId as string });
        toast.success(`Moved ${activeLead.name} to ${overId}`);
      }
    }

    if (isActiveALead && isOverALead) {
      const overLead = leads.find(l => l.id === (overId as number));
      const activeLead = leads.find(l => l.id === activeId);
      if (overLead && activeLead && activeLead.status !== overLead.status) {
        updateStatusMutation.mutate({ id: activeId, status: overLead.status });
        toast.success(`Moved ${activeLead.name} to ${overLead.status}`);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
  };

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  };

  const activeLead = activeId ? leads.find(l => l.id === activeId) : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {currentUser?.role === 'admin' ? "Pipeline" : "My Pipeline"}
          </h1>
          <p className="text-muted-foreground mt-1">Drag and drop to manage deal stages.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Deal
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex h-full gap-4 overflow-x-auto pb-4 items-start">
          {COLUMNS.map((col) => {
            const columnLeads = leads.filter((l) => l.status === col.id);
            const totalValue = columnLeads.reduce((acc, l) => acc + l.value, 0);

            return (
              <div key={col.id} className="w-[300px] min-w-[300px] flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2 px-2">
                  <h3 className="font-semibold text-sm text-foreground/80">{col.title}</h3>
                  <Badge variant="secondary" className="text-xs font-mono">
                    {columnLeads.length}
                  </Badge>
                </div>
                
                <div className="bg-muted/30 rounded-lg p-2 min-h-[500px] h-full border border-dashed border-transparent hover:border-muted-foreground/20 transition-colors">
                  <SortableContext 
                    items={columnLeads.map(l => l.id)} 
                    strategy={verticalListSortingStrategy}
                    id={col.id}
                  >
                    <div className="flex flex-col gap-3">
                      {columnLeads.map((lead) => (
                        <SortableLeadCard 
                          key={lead.id} 
                          lead={lead} 
                          agents={agents} 
                          onDelete={setLeadToDelete}
                        />
                      ))}
                    </div>
                  </SortableContext>
                  
                  {columnLeads.length === 0 && (
                    <div className="h-24 flex items-center justify-center text-muted-foreground/40 text-sm border-2 border-dashed border-muted rounded-md mt-2">
                      Empty
                    </div>
                  )}
                  
                  <div className="mt-4 px-2 py-1 text-xs font-medium text-muted-foreground border-t pt-2 flex justify-between gap-2">
                     <span>Total:</span>
                     <span>{formatCurrency(totalValue)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <DragOverlay dropAnimation={dropAnimation}>
          {activeLead ? (
            <div className="w-[300px]">
               <Card className="cursor-grabbing shadow-xl rotate-2">
                <CardContent className="p-3 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2">
                      <div className="text-muted-foreground/50">
                        <GripVertical className="h-4 w-4" />
                      </div>
                      <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">
                        {activeLead.company}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm leading-tight">{activeLead.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{formatCurrency(activeLead.value)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

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
                  deleteMutation.mutate(leadToDelete.id);
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
    </div>
  );
}
