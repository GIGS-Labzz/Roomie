const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const db = createClient(supabaseUrl, serviceKey);
const SUPPORT_ID = 'a99928a0-8de7-4da0-871a-22077d13945d';

async function run() {
  const email = `test_trigger_${Date.now()}@example.com`;
  const password = "TestPassword123!";
  
  console.log(`Registering test user: ${email}`);
  
  try {
    // 1. Sign up the user
    const { data: authData, error: authError } = await db.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: "Test Trigger User" }
    });
    
    if (authError) throw authError;
    
    const userId = authData.user.id;
    console.log(`User created successfully with ID: ${userId}`);
    
    // Wait a brief moment for the trigger to finish processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 2. Check if profile exists
    const { data: profile, error: profileErr } = await db
      .from('profiles')
      .select('id, display_name, onboarding_complete')
      .eq('id', userId)
      .single();
      
    if (profileErr) {
      console.log("Profile not found:", profileErr.message);
    } else {
      console.log("Profile found:", profile, `| onboarding_complete: ${profile.onboarding_complete}`);
    }
    
    // 3. Check if connection to support exists
    const { data: connections, error: connErr } = await db
      .from('connections')
      .select('id, requester_id, receiver_id, status')
      .or(`and(requester_id.eq.${SUPPORT_ID},receiver_id.eq.${userId}),and(requester_id.eq.${userId},receiver_id.eq.${SUPPORT_ID})`);
      
    if (connErr) {
      console.log("Connection check failed:", connErr.message);
    } else {
      console.log("Connections to Support found:", connections);
    }
    
    // 4. Cleanup test user
    console.log("Cleaning up test user...");
    const { error: deleteErr } = await db.auth.admin.deleteUser(userId);
    if (deleteErr) {
      console.log("Failed to delete test user:", deleteErr.message);
    } else {
      console.log("Test user cleaned up successfully!");
    }
    
  } catch (err) {
    console.error("Error during test:", err.message || err);
  }
}

run();
