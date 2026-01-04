import { 
  agents, 
  leads, 
  type Agent, 
  type Lead, 
  type CreateAgentRequest, 
  type UpdateAgentRequest,
  type CreateLeadRequest, 
  type UpdateLeadRequest,
  type LeadStatus,
  type SafeAgent
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike, or, sql } from "drizzle-orm";

export interface IStorage {
  // Auth
  getAgentByEmail(email: string): Promise<Agent | undefined>;
  
  // Agents
  getAgents(): Promise<Agent[]>;
  getAgent(id: number): Promise<Agent | undefined>;
  createAgent(agent: CreateAgentRequest): Promise<Agent>;
  updateAgent(id: number, updates: UpdateAgentRequest): Promise<Agent | undefined>;
  deleteAgent(id: number): Promise<boolean>;

  // Leads
  getLeads(filters?: { search?: string; status?: string; ownerId?: number }): Promise<Lead[]>;
  getLead(id: number): Promise<Lead | undefined>;
  createLead(lead: CreateLeadRequest): Promise<Lead>;
  updateLead(id: number, updates: UpdateLeadRequest): Promise<Lead | undefined>;
  updateLeadStatus(id: number, status: LeadStatus): Promise<Lead | undefined>;
  deleteLead(id: number): Promise<boolean>;

  // Stats
  getDashboardStats(ownerId?: number): Promise<{
    totalPipelineValue: number;
    activeLeadsCount: number;
    winRate: number;
    avgDealSize: number;
    statusDistribution: { status: string; count: number }[];
  }>;
}

export class DatabaseStorage implements IStorage {
  // === AUTH ===
  async getAgentByEmail(email: string): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.email, email));
    return agent;
  }

  // === AGENTS ===
  async getAgents(): Promise<Agent[]> {
    return await db.select().from(agents);
  }

  async getAgent(id: number): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent;
  }

  async createAgent(agent: CreateAgentRequest): Promise<Agent> {
    const [created] = await db.insert(agents).values(agent).returning();
    return created;
  }

  async updateAgent(id: number, updates: UpdateAgentRequest): Promise<Agent | undefined> {
    const [updated] = await db.update(agents).set(updates).where(eq(agents.id, id)).returning();
    return updated;
  }

  async deleteAgent(id: number): Promise<boolean> {
    const result = await db.delete(agents).where(eq(agents.id, id));
    return true;
  }

  // === LEADS ===
  async getLeads(filters?: { search?: string; status?: string; ownerId?: number }): Promise<Lead[]> {
    let query = db.select().from(leads);
    
    if (filters?.status && filters.status !== 'all') {
      query = query.where(eq(leads.status, filters.status as LeadStatus)) as any;
    }
    
    if (filters?.ownerId) {
      query = query.where(eq(leads.ownerId, filters.ownerId)) as any;
    }
    
    if (filters?.search) {
      query = query.where(
        or(
          ilike(leads.name, `%${filters.search}%`),
          ilike(leads.company, `%${filters.search}%`)
        )
      ) as any;
    }
    
    return await query;
  }

  async getLead(id: number): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead;
  }

  async createLead(lead: CreateLeadRequest): Promise<Lead> {
    const [created] = await db.insert(leads).values(lead).returning();
    return created;
  }

  async updateLead(id: number, updates: UpdateLeadRequest): Promise<Lead | undefined> {
    const [updated] = await db.update(leads).set(updates).where(eq(leads.id, id)).returning();
    return updated;
  }

  async updateLeadStatus(id: number, status: LeadStatus): Promise<Lead | undefined> {
    const [updated] = await db.update(leads).set({ status }).where(eq(leads.id, id)).returning();
    return updated;
  }

  async deleteLead(id: number): Promise<boolean> {
    await db.delete(leads).where(eq(leads.id, id));
    return true;
  }

  // === STATS ===
  async getDashboardStats(ownerId?: number): Promise<{
    totalPipelineValue: number;
    activeLeadsCount: number;
    winRate: number;
    avgDealSize: number;
    statusDistribution: { status: string; count: number }[];
  }> {
    let query = db.select().from(leads);
    if (ownerId) {
      query = query.where(eq(leads.ownerId, ownerId)) as any;
    }
    const allLeads = await query;
    
    const totalPipelineValue = allLeads.reduce((acc, lead) => acc + (lead.value || 0), 0);
    const activeLeadsCount = allLeads.filter(l => l.status !== 'closed').length;
    const closedLeads = allLeads.filter(l => l.status === 'closed').length;
    const winRate = allLeads.length > 0 ? Math.round((closedLeads / allLeads.length) * 100) : 0;
    const avgDealSize = allLeads.length > 0 ? Math.round(totalPipelineValue / allLeads.length) : 0;

    const statusCounts: Record<string, number> = {};
    allLeads.forEach(lead => {
      statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
    });

    const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
    }));

    return {
      totalPipelineValue,
      activeLeadsCount,
      winRate,
      avgDealSize,
      statusDistribution,
    };
  }
}

export const storage = new DatabaseStorage();
