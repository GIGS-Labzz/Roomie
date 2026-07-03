const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yjvjhqwuufecykvolmnq.supabase.co';
const supabaseKey = 'sb_publishable_dxrq7i9cJZzjwGBD_OnGRw_ttJFbI_N';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, birthday')
    .limit(1);
  
  console.log('DATA:', data);
  console.log('ERROR:', error);
}

test();
