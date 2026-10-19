import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPassword = "VKldeZ06lyfwsJQw";
const projectRef = "zcliqmlgfcppudvpsinn";

// Let's test connection strings
// Direct: postgresql://postgres:PASSWORD@db.zcliqmlgfcppudvpsinn.supabase.co:5432/postgres
// Or pooler: postgresql://postgres.zcliqmlgfcppudvpsinn:PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres (or 5432)
const hosts = [
  {
    name: "direct-db",
    host: `db.${projectRef}.supabase.co`,
    port: 5432,
    user: "postgres",
    database: "postgres",
    password: dbPassword,
    ssl: { rejectUnauthorized: false },
  },
  {
    name: "pooler-ap-southeast-1",
    host: `aws-0-ap-southeast-1.pooler.supabase.com`,
    port: 6543,
    user: `postgres.${projectRef}`,
    database: "postgres",
    password: dbPassword,
    ssl: { rejectUnauthorized: false },
  },
  {
    name: "pooler-us-east-1",
    host: `aws-0-us-east-1.pooler.supabase.com`,
    port: 6543,
    user: `postgres.${projectRef}`,
    database: "postgres",
    password: dbPassword,
    ssl: { rejectUnauthorized: false },
  }
];

async function runMigration() {
  const schemaSql = fs.readFileSync(path.join(__dirname, "../supabase/schema.sql"), "utf-8");
  const seedSql = fs.readFileSync(path.join(__dirname, "../supabase/seed.sql"), "utf-8");

  let connectedClient = null;

  for (const config of hosts) {
    console.log(`Attempting connection via ${config.name} (${config.host}:${config.port})...`);
    const client = new Client(config);
    try {
      await client.connect();
      console.log(`Connected successfully via ${config.name}!`);
      connectedClient = client;
      break;
    } catch (err) {
      console.log(`Failed with ${config.name}:`, err.message);
      await client.end().catch(() => {});
    }
  }

  if (!connectedClient) {
    console.error("Could not connect directly via Node pg. (Supabase direct connection might require IPv6 or specific pooler region).");
    console.log("SQL Schema is saved at supabase/schema.sql and seed data at supabase/seed.sql to run in the Supabase Dashboard SQL editor.");
    return;
  }

  try {
    console.log("Executing schema.sql...");
    await connectedClient.query(schemaSql);
    console.log("schema.sql executed successfully!");

    console.log("Executing seed.sql...");
    await connectedClient.query(seedSql);
    console.log("seed.sql executed successfully!");

    const res = await connectedClient.query("SELECT id, title, slug, status FROM public.posts;");
    console.log(`Current posts in database (${res.rows.length} rows):`);
    res.rows.forEach(r => console.log(`- [${r.status.toUpperCase()}] ${r.title} (${r.slug})`));
  } catch (err) {
    console.error("Error executing SQL:", err);
  } finally {
    await connectedClient.end();
  }
}

runMigration();
