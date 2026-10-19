import pg from "pg";

const { Client } = pg;
const dbPassword = "VKldeZ06lyfwsJQw";
const projectRef = "zcliqmlgfcppudvpsinn";

const regions = [
  "ap-southeast-3", // Jakarta (very common in Indonesia)
  "ap-southeast-1", // Singapore
  "ap-south-1",     // Mumbai
  "us-east-1",      // N. Virginia
  "us-west-1",      // N. California
  "eu-central-1",   // Frankfurt
  "eu-west-1",      // Ireland
  "ap-northeast-1", // Tokyo
  "ap-northeast-2", // Seoul
  "sa-east-1",      // Sao Paulo
  "ca-central-1"    // Canada
];

async function check() {
  for (const r of regions) {
    const host = `aws-0-${r}.pooler.supabase.com`;
    process.stdout.write(`Checking ${host}... `);
    const client = new Client({
      host,
      port: 6543,
      user: `postgres.${projectRef}`,
      database: "postgres",
      password: dbPassword,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 3500,
    });

    try {
      await client.connect();
      console.log(`\n🎉 SUCCESS! Connected to pooler region: ${r}`);
      await client.end();
      return r;
    } catch (e) {
      if (e.message.includes("tenant/user")) {
        console.log("tenant not found");
      } else if (e.message.includes("password authentication failed")) {
        console.log("tenant FOUND! But password auth issue");
        return r;
      } else {
        console.log("error:", e.message);
      }
    }
  }
}

check();
