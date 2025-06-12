import api from "../api/api";

export function resolveAvatarUrl(avatarUrl?: string): string | undefined {
  if (!avatarUrl) {
    return undefined;
  }

  try {
    const baseUrl = api.defaults.baseURL ?? "";
    return new URL(avatarUrl, baseUrl).href;
  } catch {
    return avatarUrl;
  }
}
