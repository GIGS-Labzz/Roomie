const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yjvjhqwuufecykvolmnq.supabase.co';
const supabaseKey = 'sb_publishable_dxrq7i9cJZzjwGBD_OnGRw_ttJFbI_N';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const query = `
    id,
    parent_post_id,
    parent_post:parent_post_id (
      id,
      content
    )
  `;

  const { data, error } = await supabase
    .from('posts')
    .select(query)
    .eq('id', '83742173-ac10-4f0a-80dc-5455bd146a7c');

  console.log('DATA:', data);
  console.log('ERROR:', error);
}

test();
