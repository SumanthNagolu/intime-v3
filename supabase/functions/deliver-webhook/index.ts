import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DeliveryPayload {
  delivery_id: string
  webhook_id: string
  org_id: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  try {
    const payload: DeliveryPayload = await req.json()
    const { delivery_id, webhook_id, org_id } = payload

    // Get delivery details
    const { data: delivery, error: deliveryError } = await supabase
      .from('webhook_deliveries')
      .select('*')
      .eq('id', delivery_id)
      .single()

    if (deliveryError || !delivery) {
      throw new Error(`Delivery not found: ${delivery_id}`)
    }

    // Get webhook details
    const { data: webhook, error: webhookError } = await supabase
      .from('webhooks')
      .select('*')
      .eq('id', webhook_id)
      .single()

    if (webhookError || !webhook) {
      throw new Error(`Webhook not found: ${webhook_id}`)
    }

    // Check if webhook is active
    if (webhook.status !== 'active') {
      await supabase
        .from('webhook_deliveries')
        .update({
          status: 'failed',
          error_message: 'Webhook is not active',
          delivered_at: new Date().toISOString(),
        })
        .eq('id', delivery_id)

      return new Response(JSON.stringify({ success: false, error: 'Webhook not active' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Generate signature
    const timestamp = new Date().toISOString()
    const signaturePayload = `${timestamp}.${delivery.request_body}`
    const signature = `sha256=${createHmac('sha256', webhook.secret)
      .update(signaturePayload)
      .digest('hex')}`

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-InTime-Signature': signature,
      'X-InTime-Timestamp': timestamp,
      'X-InTime-Event': delivery.event_type,
      'X-InTime-Delivery': delivery_id,
      ...(webhook.headers || {}),
    }

    // Make the request
    const startTime = Date.now()
    let response: Response
    let responseBody: string
    const responseHeaders: Record<string, string> = {}

    try {
      response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: delivery.request_body,
        signal: AbortSignal.timeout(30000), // 30 second timeout
      })

      responseBody = await response.text()
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })
    } catch (fetchError) {
      // Network or timeout error
      const duration = Date.now() - startTime

      await handleDeliveryFailure(supabase, delivery, webhook, org_id, {
        status: 0,
        body: '',
        headers: {},
        duration,
        error: fetchError instanceof Error ? fetchError.message : 'Network error',
      })

      return new Response(JSON.stringify({ success: false, error: 'Network error' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const duration = Date.now() - startTime

    // Check if successful (2xx status)
    if (response.status >= 200 && response.status < 300) {
      // Success!
      await supabase
        .from('webhook_deliveries')
        .update({
          status: 'success',
          response_status: response.status,
          response_headers: responseHeaders,
          response_body: responseBody.slice(0, 10000), // Limit stored response
          duration_ms: duration,
          delivered_at: new Date().toISOString(),
        })
        .eq('id', delivery_id)

      // Reset webhook failure count
      await supabase
        .from('webhooks')
        .update({
          consecutive_failures: 0,
          last_success_at: new Date().toISOString(),
          last_triggered_at: new Date().toISOString(),
        })
        .eq('id', webhook_id)

      return new Response(JSON.stringify({ success: true, status: response.status }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } else {
      // Failed - handle retry logic
      await handleDeliveryFailure(supabase, delivery, webhook, org_id, {
        status: response.status,
        body: responseBody,
        headers: responseHeaders,
        duration,
        error: `HTTP ${response.status}`,
      })

      return new Response(JSON.stringify({ success: false, status: response.status }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  } catch (error) {
    console.error('Webhook delivery error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function handleDeliveryFailure(
  supabase: any,
  delivery: any,
  webhook: any,
  orgId: string,
  result: {
    status: number
    body: string
    headers: Record<string, string>
    duration: number
    error: string
  }
) {
  // Get retry config
  const { data: retryConfig } = await supabase
    .from('integration_retry_config')
    .select('*')
    .eq('org_id', orgId)
    .single()

  const config = retryConfig || {
    max_retries: 3,
    retry_strategy: 'exponential',
    base_delay_seconds: 5,
    max_delay_seconds: 300,
    enable_jitter: true,
    enable_dlq: true,
  }

  const currentAttempt = delivery.attempt_number
  const maxAttempts = config.max_retries + 1 // Initial attempt + retries

  // Check if retryable (4xx client errors are not retryable, except 429)
  const isRetryable = result.status === 0 || result.status === 429 || result.status >= 500

  if (isRetryable && currentAttempt < maxAttempts) {
    // Schedule retry
    const nextDelay = calculateDelay(
      currentAttempt,
      config.retry_strategy,
      config.base_delay_seconds,
      config.max_delay_seconds,
      config.enable_jitter
    )

    const nextRetryAt = new Date(Date.now() + nextDelay * 1000).toISOString()

    await supabase
      .from('webhook_deliveries')
      .update({
        status: 'retrying',
        response_status: result.status,
        response_headers: result.headers,
        response_body: result.body.slice(0, 10000),
        duration_ms: result.duration,
        error_message: result.error,
        next_retry_at: nextRetryAt,
        attempt_number: currentAttempt + 1,
      })
      .eq('id', delivery.id)

    // Note: A separate cron job or trigger would pick up retrying deliveries
  } else {
    // Max retries exceeded or non-retryable error
    const finalStatus = config.enable_dlq ? 'dlq' : 'failed'

    await supabase
      .from('webhook_deliveries')
      .update({
        status: finalStatus,
        response_status: result.status,
        response_headers: result.headers,
        response_body: result.body.slice(0, 10000),
        duration_ms: result.duration,
        error_message: result.error,
        delivered_at: new Date().toISOString(),
      })
      .eq('id', delivery.id)
  }

  // Increment webhook failure count
  await supabase
    .from('webhooks')
    .update({
      consecutive_failures: webhook.consecutive_failures + 1,
      last_failure_at: new Date().toISOString(),
      last_triggered_at: new Date().toISOString(),
    })
    .eq('id', webhook.id)
}

function calculateDelay(
  attempt: number,
  strategy: string,
  baseDelay: number,
  maxDelay: number,
  enableJitter: boolean
): number {
  let delay: number

  switch (strategy) {
    case 'exponential':
      delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay)
      break
    case 'linear':
      delay = Math.min(baseDelay * attempt, maxDelay)
      break
    case 'fixed':
    default:
      delay = baseDelay
      break
  }

  if (enableJitter) {
    // Add 0-50% random jitter
    delay = delay * (1 + Math.random() * 0.5)
  }

  return Math.round(delay)
}
