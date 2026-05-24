import { describe, expect, it } from 'vitest';

import {
  getMissingSupabaseEnvVars,
  getSupabaseConfigurationError,
  getSupabaseProjectConfig,
  requireBrowserSupabaseClient,
} from '@/lib/supabase/client';

describe('supabase configuration helpers', () => {
  it('returns missing env vars and descriptive error when unset', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    expect(getMissingSupabaseEnvVars()).toEqual([
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    ]);
    expect(getSupabaseProjectConfig()).toBeNull();
    expect(getSupabaseConfigurationError()?.message).toMatch(/not configured/i);
    expect(() => requireBrowserSupabaseClient()).toThrow(/missing NEXT_PUBLIC_SUPABASE_URL/i);
  });

  it('returns config when env vars are present', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

    expect(getMissingSupabaseEnvVars()).toEqual([]);
    expect(getSupabaseProjectConfig()).toEqual({
      url: 'https://example.supabase.co',
      anonKey: 'anon-key',
    });
  });
});
