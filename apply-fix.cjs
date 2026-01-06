const fs = require('fs');

const filePath = 'D:/REPLIT/Leads/LMS/LMS/server/routes.ts';
let content = fs.readFileSync(filePath, 'utf8');

const oldCode = `// Check if agent has assigned leads
    const leads = await storage.getLeads({ ownerId: agentId });
    if (leads.length > 0) {
      return res.status(400).json({
        message: \`Cannot delete agent with \${leads.length} assigned lead(s). Please reassign the leads first.\`
      });
    }`;

const newCode = `// Reassign leads to admin before deleting
    const admin = await storage.getAgentByEmail('admin');
    if (admin && admin.id !== agentId) {
      const leads = await storage.getLeads({ ownerId: agentId });
      for (const lead of leads) {
        await storage.updateLead(lead.id, { ownerId: admin.id });
      }
    }`;

if (content.includes('// Check if agent has assigned leads')) {
  content = content.replace(oldCode, newCode);
  fs.writeFileSync(filePath, content);
  console.log('Fix applied successfully!');
} else {
  console.log('Already fixed or pattern not found');
}
