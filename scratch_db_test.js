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
  db: { schema: 'auth' }
});

async function run() {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, email, encrypted_password')
    .limit(1);

  if (error) {
    console.error("Error querying auth.users:", error);
  } else {
    console.log("Success! Users fetched:", data);
  }
}

run();
