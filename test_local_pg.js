const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://roomie:localdevpassword@localhost:5433/roomie"
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to local postgres successfully!");
    const res = await client.query("SELECT version();");
    console.log("Postgres version:", res.rows[0].version);
    await client.end();
  } catch (err) {
    console.error("Failed to connect to local postgres:", err.message);
  }
}

run();
