export function getActiveUserId(): string | null {
  return process.env.NEXT_PUBLIC_APP_USER_ID ?? null;
}
