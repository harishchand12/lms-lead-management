const fs = require('fs');
let content = fs.readFileSync('D:/REPLIT/Leads/LMS/LMS/server/routes.ts', 'utf8');

// Use regex to find and replace the block
const regex = /\/\/ Check if agent has assigned leads[\s\S]*?if \(leads\.length > 0\) \{[\s\S]*?Please reassign the leads first\.[\s\S]*?\}\s*\}/;

const newCode = `// Reassign leads to admin before deleting
    const admin = await storage.getAgentByEmail('admin');
    if (admin && admin.id !== agentId) {
      const leads = await storage.getLeads({ ownerId: agentId });
      for (const lead of leads) {
        await storage.updateLead(lead.id, { ownerId: admin.id });
      }
    }`;

if (regex.test(content)) {
  content = content.replace(regex, newCode);
  fs.writeFileSync('D:/REPLIT/Leads/LMS/LMS/server/routes.ts', content);
  console.log('Fix applied successfully!');
} else {
  console.log('Pattern not found - may already be fixed');
}
