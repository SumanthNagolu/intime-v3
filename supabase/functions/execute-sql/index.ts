// Edge Function to execute arbitrary SQL
// Requires service role key for authorization
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

interface SqlRequest {
  sql: string;
}

interface SqlResponse {
  success: boolean;
  rows?: any[];
  rowCount?: number;
  error?: string;
}

Deno.serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // Verify authorization
    const authHeader = req.headers.get('Authorization');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!authHeader || !authHeader.includes(serviceRoleKey!)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Unauthorized - Service role key required'
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse request
    const { sql }: SqlRequest = await req.json();

    if (!sql) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing sql parameter'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Connect to database
    const client = new Client({
      user: Deno.env.get('DB_USER') || 'postgres',
      password: Deno.env.get('DB_PASSWORD'),
      database: Deno.env.get('DB_NAME') || 'postgres',
      hostname: Deno.env.get('DB_HOST'),
      port: parseInt(Deno.env.get('DB_PORT') || '5432'),
    });

    await client.connect();

    try {
      // Execute SQL and capture results
      const result = await client.queryObject(sql);

      const response: SqlResponse = {
        success: true,
        rows: result.rows || [],
        rowCount: result.rowCount || 0,
      };

      await client.end();

      return new Response(
        JSON.stringify(response),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    } catch (sqlError: any) {
      await client.end();

      return new Response(
        JSON.stringify({
          success: false,
          error: `SQL Error: ${sqlError.message}`
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});

/*
 * Usage:
 *
 * curl -X POST 'https://gkwhxmvugnjwwwiufmdy.supabase.co/functions/v1/execute-sql' \
 *   -H 'Authorization: Bearer [SERVICE_ROLE_KEY]' \
 *   -H 'Content-Type: application/json' \
 *   -d '{"sql":"SELECT * FROM roles"}'
 */
