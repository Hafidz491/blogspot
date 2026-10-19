import pg from "pg";
import dns from "node:dns/promises";
import fs from "node:fs";
import path from "node:path";

const { Client } = pg;

// Read config from .env.local or process.env safely
function getEnvConfig() {
  const envPath = path.resolve(".env.local");
  let dbPassword = process.env.SUPABASE_DB_PASSWORD || "";
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const val = match[2].trim().replace(/^["']|["']$/g, "");
        if (key === "SUPABASE_DB_PASSWORD" && !dbPassword) dbPassword = val;
        if (key === "NEXT_PUBLIC_SUPABASE_URL" && !supabaseUrl) supabaseUrl = val;
      }
    }
  }

  const projectRef = supabaseUrl
    ? supabaseUrl.replace("https://", "").split(".")[0]
    : "zcliqmlgfcppudvpsinn";

  return { projectRef, dbPassword };
}

async function main() {
  const { projectRef, dbPassword } = getEnvConfig();

  if (!dbPassword) {
    console.error("❌ SUPABASE_DB_PASSWORD tidak ditemukan di .env.local atau environment variables!");
    process.exit(1);
  }

  console.log("Looking up connection options for Supabase project:", projectRef);

  // Candidate regions for pooler
  const regions = [
    "ap-southeast-1", // Singapore (most common for ID/Asia)
    "ap-southeast-2", // Sydney
    "ap-northeast-1", // Tokyo
    "ap-northeast-2", // Seoul
    "ap-south-1",     // Mumbai
    "us-east-1",      // N. Virginia
    "us-west-1",      // N. California
    "eu-central-1",   // Frankfurt
    "eu-west-1",      // Ireland
  ];

  const candidateHosts = [
    {
      label: "Direct connection (db.projectRef.supabase.co:5432)",
      host: `db.${projectRef}.supabase.co`,
      port: 5432,
      user: "postgres",
    },
    ...regions.map((reg) => ({
      label: `Pooler ${reg} (port 6543, session mode)`,
      host: `aws-0-${reg}.pooler.supabase.com`,
      port: 6543,
      user: `postgres.${projectRef}`,
    })),
    ...regions.map((reg) => ({
      label: `Pooler ${reg} (port 5432, transaction mode)`,
      host: `aws-0-${reg}.pooler.supabase.com`,
      port: 5432,
      user: `postgres.${projectRef}`,
    })),
  ];

  let connectedClient = null;

  for (const item of candidateHosts) {
    process.stdout.write(`Trying ${item.label}... `);
    const client = new Client({
      host: item.host,
      port: item.port,
      user: item.user,
      password: dbPassword,
      database: "postgres",
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 4000,
    });

    try {
      await client.connect();
      console.log("SUCCESS!");
      connectedClient = client;
      break;
    } catch (err) {
      console.log(`Failed: ${err.message}`);
      try {
        await client.end();
      } catch {}
    }
  }

  if (!connectedClient) {
    console.error("Could not connect to any Supabase host directly via PostgreSQL.");
    process.exit(1);
  }

  console.log("Executing schema.sql on database...");
  const schemaPath = path.resolve("supabase/schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf8");

  try {
    await connectedClient.query(schemaSql);
    console.log("ALL TABLES, POLICIES, BUCKET CONFIG, AND SCHEMA APPLIED SUCCESSFULLY!");

    // Verify tables
    const res = await connectedClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    console.log("Public tables currently in database:", res.rows.map(r => r.table_name));

    // Verify storage bucket
    const bucketRes = await connectedClient.query(`
      SELECT id, name, public FROM storage.buckets WHERE id = 'blog-media';
    `);
    console.log("Storage bucket 'blog-media':", bucketRes.rows);

    // Seed default site_settings if empty
    const settingsRes = await connectedClient.query(`SELECT id FROM public.site_settings WHERE id = 'general';`);
    if (settingsRes.rowCount === 0) {
      console.log("Seeding default site_settings...");
      const defaultSettings = {
        brandName: "Kindsight",
        brandTagline: "Modern Insights & Resources",
        heroBadge: "Editorial & Insights",
        heroTitle: "The Kindsight Blog",
        heroDescription: "Practical strategies, thoughtful perspectives, and tools for modern philanthropy.",
        newsletterBadge: "VIP Newsletter",
        newsletterTitle: "Be the first to read our resources.",
        newsletterDescription: "The creative fundraising revolution — and our collaborative ideas starting in our VIP inbox will provide you real insights and transparency sent straight to your inbox.",
        newsletterButtonText: "Subscribe Now",
        footerAboutTitle: "The Kindsight Blog",
        footerAboutDescription: "Curated perspectives on nonprofit growth, donor relationships, modern fundraising strategies, and philanthropic innovations.",
        copyrightText: "© 2026 The Kindsight Blog. All rights reserved.",
        contactEmail: "editorial@kindsight.org",
        socialTwitter: "https://twitter.com",
        socialLinkedIn: "https://linkedin.com",
        socialInstagram: "https://instagram.com"
      };
      await connectedClient.query(
        `INSERT INTO public.site_settings (id, settings, updated_at) VALUES ('general', $1, NOW())`,
        [JSON.stringify(defaultSettings)]
      );
      console.log("Default site_settings seeded successfully!");
    } else {
      console.log("site_settings already present in database.");
    }

  } catch (err) {
    console.error("Error executing schema:", err);
  } finally {
    await connectedClient.end();
  }
}

main().catch(console.error);
