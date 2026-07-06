const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const db = createClient(supabaseUrl, serviceKey);

async function run() {
  try {
    // We can query the postgres catalog to get the function definition
    const { data, error } = await db.rpc('get_function_def', {});
    
    // If get_function_def RPC doesn't exist (which it probably doesn't unless we created it),
    // we can use a direct SQL query if we had it, but Supabase JS doesn't allow executing arbitrary SQL directly unless we use an RPC.
    // Wait, let's see if we can check it using a different method, or check if we can run query with pg package.
    // Let's check if the pg package is in node_modules and we can use it to connect directly to the database.
    console.log("Supabase url:", supabaseUrl);
  } catch (err) {
    console.error(err);
  }
}

run();
