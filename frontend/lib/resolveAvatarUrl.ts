export function resolveAvatarUrl(avatarUrl?: string): string | undefined {
  if (!avatarUrl) return undefined;
  try {
    return new URL(avatarUrl, process.env.NEXT_PUBLIC_API_URL || "").href;
  } catch {
    return avatarUrl;
  }
}
