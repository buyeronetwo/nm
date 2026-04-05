import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export function createSupabaseBrowserLikeClient(
  supabaseUrl: string,
  anonKey: string,
): SupabaseClient {
  return createClient(supabaseUrl.trim(), anonKey.trim(), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export function createSupabaseServiceRoleClient(
  supabaseUrl: string,
  serviceRoleKey: string,
): SupabaseClient {
  return createClient(supabaseUrl.trim(), serviceRoleKey.trim(), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export function resolveSupabaseUrl(environment: Record<string, string | undefined>): string | undefined {
  return (
    environment.SUPABASE_URL?.trim() ||
    environment.VITE_SUPABASE_URL?.trim() ||
    undefined
  )
}

export function resolveSupabaseAnonKey(environment: Record<string, string | undefined>): string | undefined {
  return (
    environment.SUPABASE_ANON_KEY?.trim() ||
    environment.VITE_SUPABASE_ANON_KEY?.trim() ||
    undefined
  )
}

export function resolveSupabaseServiceRoleKey(
  environment: Record<string, string | undefined>,
): string | undefined {
  return environment.SUPABASE_SERVICE_ROLE_KEY?.trim() || undefined
}

export function isSupabaseVacanciesReadConfigured(
  environment: Record<string, string | undefined>,
): boolean {
  return Boolean(resolveSupabaseUrl(environment) && resolveSupabaseAnonKey(environment))
}

export function isSupabaseVacanciesWriteConfigured(
  environment: Record<string, string | undefined>,
): boolean {
  return Boolean(resolveSupabaseUrl(environment) && resolveSupabaseServiceRoleKey(environment))
}
