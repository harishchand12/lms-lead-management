const fs = require('fs');
const pg = require('pg');

const DATABASE_URL = "postgresql://neondb_owner:npg_kX1ACSnNDL7R@ep-calm-cloud-a495g062-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function importSQL() {
  const pool = new pg.Pool({ connectionString: DATABASE_URL });
  
  try {
    console.log("Connecting to database...");
    const client = await pool.connect();
    console.log("Connected successfully!");
    
    // First, clear existing data
    console.log("Clearing existing data...");
    await client.query("DELETE FROM leads");
    await client.query("DELETE FROM agents");
    
    // Reset sequences
    await client.query("ALTER SEQUENCE agents_id_seq RESTART WITH 1");
    await client.query("ALTER SEQUENCE leads_id_seq RESTART WITH 1");
    
    // Read and parse the SQL file
    const sqlContent = fs.readFileSync('d:/REPLIT/misc/leadssddss.sql', 'utf8');
    
    // Extract agents data from COPY statement
    const agentsMatch = sqlContent.match(/COPY public\.agents[^;]+FROM stdin;\n([\s\S]*?)\n\\\./);
    if (agentsMatch) {
      const agentsData = agentsMatch[1].trim().split('\n');
      console.log(`Importing ${agentsData.length} agents...`);
      
      for (const line of agentsData) {
        const parts = line.split('\t');
        if (parts.length >= 6) {
          const [id, name, email, role, avatar, password] = parts;
          const avatarVal = avatar === '\\N' ? null : avatar;
          await client.query(
            `INSERT INTO agents (id, name, email, role, avatar, password) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
            [parseInt(id), name, email, role, avatarVal, password]
          );
        }
      }
    }
    
    // Extract leads data from COPY statement
    const leadsMatch = sqlContent.match(/COPY public\.leads[^;]+FROM stdin;\n([\s\S]*?)\n\\\./);
    if (leadsMatch) {
      const leadsData = leadsMatch[1].trim().split('\n');
      console.log(`Importing ${leadsData.length} leads...`);
      
      for (const line of leadsData) {
        const parts = line.split('\t');
        if (parts.length >= 14) {
          const [id, name, company, email, phone, alternate_phone, status, temperature, value, last_contact, next_followup, followup_note, owner_id, created_at] = parts;
          
          const nullify = (v) => v === '\\N' ? null : v;
          
          await client.query(
            `INSERT INTO leads (id, name, company, email, phone, alternate_phone, status, temperature, value, last_contact, next_followup, followup_note, owner_id, created_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) ON CONFLICT (id) DO NOTHING`,
            [
              parseInt(id), 
              name, 
              company, 
              email, 
              nullify(phone), 
              nullify(alternate_phone), 
              status, 
              temperature, 
              parseInt(value) || 0, 
              nullify(last_contact), 
              nullify(next_followup), 
              nullify(followup_note), 
              parseInt(owner_id) || null, 
              nullify(created_at)
            ]
          );
        }
      }
    }
    
    // Update sequences to max id + 1
    await client.query("SELECT setval('agents_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM agents))");
    await client.query("SELECT setval('leads_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM leads))");
    
    console.log("SQL imported successfully!");
    client.release();
  } catch (error) {
    console.error("Error importing SQL:", error.message);
  } finally {
    await pool.end();
  }
}

importSQL();
