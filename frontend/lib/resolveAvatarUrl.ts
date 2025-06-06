export function resolveAvatarUrl(avatarUrl?: string): string | undefined {
  if (!avatarUrl) {
    return undefined;
  }

  const envBase = process.env.NEXT_PUBLIC_API_URL;
  const runtimeBase =
    !envBase && typeof window !== "undefined"
      ? window.location.origin
      : undefined;
  const base = envBase ?? runtimeBase ?? "http://localhost:8000";

  try {
    return new URL(avatarUrl, base).href;
  } catch {
    return avatarUrl;
  }
}
