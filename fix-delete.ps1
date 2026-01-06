$file = "D:\REPLIT\Leads\LMS\LMS\server\routes.ts"
$content = Get-Content $file -Raw

$oldCode = @"
  app.delete(api.agents.delete.path, requireAdmin, async (req, res) => {
    const agentId = Number(req.params.id);

    // Check if agent has assigned leads
    const leads = await storage.getLeads({ ownerId: agentId });
    if (leads.length > 0) {
      return res.status(400).json({
        message: `Cannot delete agent with `${leads.length} assigned lead(s). Please reassign the leads first.`
      });
    }

    await storage.deleteAgent(agentId);
    res.status(204).send();
  });
"@

$newCode = @"
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
"@

$content = $content.Replace($oldCode, $newCode)
Set-Content $file $content -NoNewline
Write-Host "File updated successfully"
