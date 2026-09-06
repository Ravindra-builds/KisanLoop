const postgres = require('postgres');
const fs = require('fs');

// Read .env.local manually
const env = fs.readFileSync('.env.local', 'utf8');
const match = env.match(/DATABASE_URL=(.+)/);
const dbUrl = match ? match[1].trim() : '';

const sql = postgres(dbUrl);

async function test() {
  try {
    const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log('Tables in DB:', tables.map(t => t.table_name));
    try {
      const farmers = await sql`SELECT count(*) FROM farmers`;
      console.log('Farmers count:', farmers[0].count);
    } catch (e) {
      console.log('Farmers table check error:', e.message);
    }
  } catch (err) {
    console.error('DB Error:', err.message);
  } finally {
    await sql.end();
  }
}
test();
