const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function run() {
  // 1. Get a user ID from profiles
  const { data: profiles, error: pError } = await supabase
    .from('profiles')
    .select('id, username')
    .limit(1);

  if (pError || !profiles || profiles.length === 0) {
    console.error("Error getting profile:", pError);
    return;
  }

  const userId = profiles[0].id;
  console.log("Checking user ID:", userId, "username:", profiles[0].username);

  // 2. Fetch user via auth admin API
  const { data: { user }, error: authError } = await supabase.auth.admin.getUserById(userId);

  if (authError) {
    console.error("Error fetching user from auth.admin:", authError);
  } else {
    console.log("User details successfully fetched!");
    console.log("app_metadata:", JSON.stringify(user.app_metadata, null, 2));
    console.log("user_metadata:", JSON.stringify(user.user_metadata, null, 2));
    console.log("identities:", JSON.stringify(user.identities, null, 2));
    console.log("email:", user.email);
  }
}

run();
