const fs = require('fs');
let lines = fs.readFileSync('D:/REPLIT/Leads/LMS/LMS/server/routes.ts', 'utf8').split('\n');

// Find the start line of the delete handler (line 146, index 145)
let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('app.delete(api.agents.delete.path')) {
    startIdx = i;
  }
  if (startIdx >= 0 && lines[i].includes('// === LEADS ===')) {
    endIdx = i;
    break;
  }
}

if (startIdx >= 0 && endIdx >= 0) {
  // Replace lines startIdx to endIdx-1 (exclusive) with new code
  const newCode = `  app.delete(api.agents.delete.path, requireAdmin, async (req, res) => {
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

`;

  const before = lines.slice(0, startIdx);
  const after = lines.slice(endIdx);
  
  const newLines = [...before, newCode, ...after];
  fs.writeFileSync('D:/REPLIT/Leads/LMS/LMS/server/routes.ts', newLines.join('\n'));
  console.log(`Fix applied! Replaced lines ${startIdx + 1} to ${endIdx}`);
} else {
  console.log('Could not find the section to replace');
  console.log('startIdx:', startIdx, 'endIdx:', endIdx);
}
