import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import type { SafeAgent } from "@shared/schema";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

// Helper to strip password from agent
function toSafeAgent(agent: { id: number; name: string; email: string; password: string; role: string; avatar: string | null }): SafeAgent {
  const { password, ...safe } = agent;
  return safe as SafeAgent;
}

// Auth middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  next();
}

// Admin-only middleware
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // === AUTH ===
  app.post(api.auth.login.path, async (req, res) => {
    try {
      const input = api.auth.login.input.parse(req.body);
      const agent = await storage.getAgentByEmail(input.email);
      
      if (!agent) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      
      const isPasswordValid = await bcrypt.compare(input.password, agent.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      
      const safeAgent = toSafeAgent(agent);
      req.session.user = safeAgent;
      res.json(safeAgent);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(401).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to logout' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    res.json(req.session.user || null);
  });

  // === AGENTS === (Protected routes - Admin only for management)
  app.get(api.agents.list.path, requireAuth, async (req, res) => {
    const user = req.session.user!;
    // Agents can only see their own profile, admins see all
    if (user.role === 'agent') {
      const agent = await storage.getAgent(user.id);
      res.json(agent ? [toSafeAgent(agent)] : []);
    } else {
      const agents = await storage.getAgents();
      const safeAgents = agents.map(toSafeAgent);
      res.json(safeAgents);
    }
  });

  app.get(api.agents.get.path, requireAuth, async (req, res) => {
    const user = req.session.user!;
    const agentId = Number(req.params.id);
    
    // Agents can only view their own profile
    if (user.role === 'agent' && agentId !== user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const agent = await storage.getAgent(agentId);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    res.json(toSafeAgent(agent));
  });

  app.post(api.agents.create.path, requireAdmin, async (req, res) => {
    try {
      const input = api.agents.create.input.parse(req.body);
      const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);
      const agent = await storage.createAgent({ ...input, password: hashedPassword });
      res.status(201).json(toSafeAgent(agent));
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.agents.update.path, requireAdmin, async (req, res) => {
    try {
      const input = api.agents.update.input.parse(req.body);
      const agent = await storage.updateAgent(Number(req.params.id), input);
      if (!agent) {
        return res.status(404).json({ message: 'Agent not found' });
      }
      res.json(toSafeAgent(agent));
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.agents.delete.path, requireAdmin, async (req, res) => {
    const agentId = Number(req.params.id);

    // Reassign leads to admin before deleting
    const admin = await storage.getAgentByEmail('admin');
    if (admin && admin.id !== agentId) {
      const leads = await storage.getLeads({ ownerId: agentId });
      for (const lead of leads) {
        await storage.updateLead(lead.id, { ownerId: admin.id });
      }
    }

    await storage.deleteAgent(agentId);
    res.status(204).send();
  });


  // === LEADS === (Protected routes)
  app.get(api.leads.list.path, requireAuth, async (req, res) => {
    const user = req.session.user!;
    const filters: { search?: string; status?: string; ownerId?: number } = {
      search: req.query.search as string | undefined,
      status: req.query.status as string | undefined,
    };
    
    // Agents can only see their own leads, admins see all
    if (user.role === 'agent') {
      filters.ownerId = user.id;
    } else if (req.query.ownerId) {
      filters.ownerId = Number(req.query.ownerId);
    }
    
    const leads = await storage.getLeads(filters);
    res.json(leads);
  });

  app.get(api.leads.get.path, requireAuth, async (req, res) => {
    const user = req.session.user!;
    const lead = await storage.getLead(Number(req.params.id));
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    // Agents can only view their own leads
    if (user.role === 'agent' && lead.ownerId !== user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(lead);
  });

  app.post(api.leads.create.path, requireAuth, async (req, res) => {
    try {
      const user = req.session.user!;
      const bodySchema = api.leads.create.input.extend({
        value: z.coerce.number().optional(),
        ownerId: z.coerce.number().nullable().optional(),
        nextFollowup: z.coerce.date().nullable().optional(),
        lastContact: z.coerce.date().nullable().optional(),
      });
      const input = bodySchema.parse(req.body);
      
      // Agents can only create leads assigned to themselves
      if (user.role === 'agent') {
        input.ownerId = user.id;
      }
      
      const lead = await storage.createLead(input);
      res.status(201).json(lead);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.leads.update.path, requireAuth, async (req, res) => {
    try {
      const user = req.session.user!;
      const existingLead = await storage.getLead(Number(req.params.id));
      if (!existingLead) {
        return res.status(404).json({ message: 'Lead not found' });
      }
      // Agents can only update their own leads
      if (user.role === 'agent' && existingLead.ownerId !== user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const bodySchema = api.leads.update.input.extend({
        value: z.coerce.number().optional(),
        ownerId: z.coerce.number().nullable().optional(),
        nextFollowup: z.coerce.date().nullable().optional(),
        lastContact: z.coerce.date().nullable().optional(),
      });
      const input = bodySchema.parse(req.body);
      
      // Agents cannot reassign lead ownership - preserve current ownerId
      if (user.role === 'agent') {
        delete input.ownerId;
      }
      
      const lead = await storage.updateLead(Number(req.params.id), input);
      res.json(lead);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.patch(api.leads.updateStatus.path, requireAuth, async (req, res) => {
    try {
      const user = req.session.user!;
      const existingLead = await storage.getLead(Number(req.params.id));
      if (!existingLead) {
        return res.status(404).json({ message: 'Lead not found' });
      }
      // Agents can only update their own leads
      if (user.role === 'agent' && existingLead.ownerId !== user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const input = api.leads.updateStatus.input.parse(req.body);
      const lead = await storage.updateLeadStatus(Number(req.params.id), input.status);
      res.json(lead);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.leads.delete.path, requireAuth, async (req, res) => {
    const user = req.session.user!;
    const existingLead = await storage.getLead(Number(req.params.id));
    if (!existingLead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    // Agents can only delete their own leads
    if (user.role === 'agent' && existingLead.ownerId !== user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await storage.deleteLead(Number(req.params.id));
    res.status(204).send();
  });

  // === STATS === (Protected route)
  app.get(api.stats.dashboard.path, requireAuth, async (req, res) => {
    const user = req.session.user!;
    // For agents, filter stats to their own leads
    const stats = await storage.getDashboardStats(user.role === 'agent' ? user.id : undefined);
    res.json(stats);
  });

  // Seed database on startup
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  console.log('[seed] Checking database for existing agents...');
  const existingAgents = await storage.getAgents();
  console.log(`[seed] Found ${existingAgents.length} existing agents`);
  
  // Always ensure admin exists
  const adminExists = existingAgents.find(a => a.email === 'admin');
  if (!adminExists) {
    console.log('[seed] Admin not found, creating admin user...');
    const adminPassword = await bcrypt.hash('H@rish09aa', SALT_ROUNDS);
    await storage.createAgent({ name: 'Admin', email: 'admin', password: adminPassword, role: 'admin' });
    console.log('[seed] Admin user created');
  }
  
  if (existingAgents.length === 0) {
    console.log('[seed] No agents found, seeding database...');
    // Create agents with hashed passwords
    const jamiePassword = await bcrypt.hash('agent123', SALT_ROUNDS);
    const samPassword = await bcrypt.hash('agent123', SALT_ROUNDS);
    
    const admin = await storage.getAgentByEmail('admin');
    const jamie = await storage.createAgent({ name: 'Jamie Lee', email: 'jamie@leea.com', password: jamiePassword, role: 'agent' });
    const sam = await storage.createAgent({ name: 'Sam Rivera', email: 'sam@leea.com', password: samPassword, role: 'agent' });
    const alex = admin!;

    // Create leads
    await storage.createLead({
      name: 'Sarah Chen',
      company: 'TechFlow Dynamics',
      email: 'sarah.c@techflow.com',
      phone: '+91 98765 43210',
      status: 'qualified',
      temperature: 'hot',
      value: 1250000,
      nextFollowup: new Date('2024-01-20'),
      followupNote: 'Discuss Q1 requirements',
      ownerId: alex.id,
    });

    await storage.createLead({
      name: 'Michael Ross',
      company: 'Apex Manufacturing',
      email: 'mross@apex.co',
      phone: '+91 87654 32109',
      status: 'negotiation',
      temperature: 'hot',
      value: 4500000,
      nextFollowup: new Date('2024-01-22'),
      followupNote: 'Final price negotiation',
      ownerId: jamie.id,
    });

    await storage.createLead({
      name: 'Jessica Wu',
      company: 'Global Logistics',
      email: 'j.wu@glogistics.net',
      phone: '+91 76543 21098',
      status: 'new',
      temperature: 'warm',
      value: 820000,
      nextFollowup: new Date('2024-01-18'),
      followupNote: 'Introduction call',
      ownerId: alex.id,
    });

    await storage.createLead({
      name: 'David Miller',
      company: 'Miller & Sons',
      email: 'david@millersons.com',
      phone: '+91 65432 10987',
      status: 'contacted',
      temperature: 'warm',
      value: 1500000,
      nextFollowup: new Date('2024-01-25'),
      followupNote: 'Follow up on technical specs',
      ownerId: sam.id,
    });

    await storage.createLead({
      name: 'Emily Davis',
      company: 'BrightStar Energy',
      email: 'edavis@brightstar.io',
      phone: '+91 54321 09876',
      status: 'proposal',
      temperature: 'hot',
      value: 2800000,
      nextFollowup: new Date('2024-01-21'),
      followupNote: 'Present solution deck',
      ownerId: jamie.id,
    });

    await storage.createLead({
      name: 'Raj Patel',
      company: 'Patel Industries',
      email: 'raj@patelindustries.in',
      phone: '+91 43210 98765',
      status: 'closed',
      temperature: 'hot',
      value: 3200000,
      followupNote: 'Deal closed successfully',
      ownerId: sam.id,
    });

    console.log('Database seeded with initial data');
  }
}
