const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Environment variables missing!");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  db: { schema: 'public' }
});

async function run() {
  const { data, error } = await supabaseAdmin
    .from('platform_clicks')
    .select('*');

  if (error) {
    console.error("Error querying platform_clicks:", error);
  } else {
    console.log("Success! platform_clicks fetched:", data);
  }
}

run();
