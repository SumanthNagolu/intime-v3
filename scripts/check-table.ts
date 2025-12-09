import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  // Check if sequence_templates table exists
  const { data, error } = await supabase
    .from('sequence_templates')
    .select('id')
    .limit(1);
  
  console.log('sequence_templates query result:', { data, error });
  
  // Check campaigns table
  const { data: campaigns, error: campError } = await supabase
    .from('campaigns')
    .select('id, name')
    .limit(1);
  
  console.log('campaigns query result:', { data: campaigns, error: campError });
}

check();
