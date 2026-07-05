const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const db = createClient(supabaseUrl, serviceKey);

async function run() {
  const { data, error } = await db
    .from("profiles")
    .select("id, roommate_pref_public")
    .limit(1);

  if (error) {
    console.log("Column check failed:", error.message, error.code);
  } else {
    console.log("Column check succeeded! roommate_pref_public exists:", data);
  }
}

run();
