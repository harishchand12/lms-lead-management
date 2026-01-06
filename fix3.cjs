const fs = require('fs');
let content = fs.readFileSync('D:/REPLIT/Leads/LMS/LMS/server/routes.ts', 'utf8');

const oldCode = `app.delete(api.agents.delete.path, requireAdmin, async (req, res) => {
    const agentId = Number(req.params.id);

    // Check if agent has assigned leads
    const leads = await storage.getLeads({ ownerId: agentId });
    if (leads.length > 0) {
      return res.status(400).json({
        message: \`Cannot delete agent with \${leads.length} assigned lead(s). Please reassign the leads first.\`
      });
    }

    await storage.deleteAgent(agentId);
    res.status(204).send();
  });`;

const newCode = `app.delete(api.agents.delete.path, requireAdmin, async (req, res) => {
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
  });`;

if (content.includes('// Check if agent has assigned leads')) {
  content = content.replace(oldCode, newCode);
  fs.writeFileSync('D:/REPLIT/Leads/LMS/LMS/server/routes.ts', content);
  console.log('Fix applied successfully!');
} else {
  console.log('Pattern not found - may already be fixed');
}
