// @ts-nocheck — файл выполняется в Deno (Supabase Edge), не в Node.
// Деплой: supabase functions deploy telegram-webhook

Deno.serve((_request: Request) => {
  return new Response(JSON.stringify({ ok: true, hint: 'telegram-webhook stub' }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
