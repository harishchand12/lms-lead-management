import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_kX1ACSnNDL7R@ep-calm-cloud-a495g062-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function importSQL() {
  const pool = new pg.Pool({ connectionString: DATABASE_URL });
  
  try {
    console.log("Connecting to database...");
    const client = await pool.connect();
    console.log("Connected successfully!");
    
    // Read the SQL file
    const sqlFilePath = "d:\\REPLIT\\misc\\leadssddss.sql";
    console.log(`Reading SQL file from: ${sqlFilePath}`);
    const sqlContent = fs.readFileSync(sqlFilePath, "utf8");
    
    console.log("Executing SQL...");
    await client.query(sqlContent);
    console.log("SQL imported successfully!");
    
    client.release();
  } catch (error) {
    console.error("Error importing SQL:", error.message);
  } finally {
    await pool.end();
  }
}

importSQL();
