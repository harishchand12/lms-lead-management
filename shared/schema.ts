import { pgTable, text, serial, integer, timestamp, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "agent"] }).notNull().default("agent"),
  avatar: text("avatar"),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  company: text("company").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  alternatePhone: text("alternate_phone"),
  status: text("status", { enum: ["new", "contacted", "qualified", "proposal", "negotiation", "closed"] }).notNull().default("new"),
  temperature: text("temperature", { enum: ["hot", "warm", "cold"] }).notNull().default("warm"),
  value: integer("value").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  lastContact: timestamp("last_contact").defaultNow(),
  nextFollowup: timestamp("next_followup"),
  followupNote: text("followup_note"),
  ownerId: integer("owner_id").references(() => agents.id),
});

// === RELATIONS ===

export const agentsRelations = relations(agents, ({ many }) => ({
  leads: many(leads),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
  owner: one(agents, {
    fields: [leads.ownerId],
    references: [agents.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertAgentSchema = createInsertSchema(agents).omit({ id: true });
export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true, lastContact: true });

// Login schema
export const loginSchema = z.object({
  email: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
});

// === EXPLICIT API CONTRACT TYPES ===

// Agent types
export type Agent = typeof agents.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type CreateAgentRequest = InsertAgent;
export type UpdateAgentRequest = Partial<InsertAgent>;
export type AgentResponse = Agent;

// Lead types
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type CreateLeadRequest = InsertLead;
export type UpdateLeadRequest = Partial<InsertLead>;
export type LeadResponse = Lead;

// Lead status type
export type LeadStatus = "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "closed";
export type LeadTemperature = "hot" | "warm" | "cold";

// Auth types
export type LoginRequest = z.infer<typeof loginSchema>;
export type SafeAgent = Omit<Agent, 'password'>;
