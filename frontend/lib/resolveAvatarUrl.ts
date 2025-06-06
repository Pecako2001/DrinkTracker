export function resolveAvatarUrl(avatarUrl?: string): string | undefined {
  // Log the raw argument on every invocation:
  console.log("[resolveAvatarUrl] received avatarUrl →", avatarUrl);

  if (!avatarUrl) {
    console.log(
      "[resolveAvatarUrl] avatarUrl is undefined or empty → returning undefined"
    );
    return undefined;
  }

  try {
    const fullUrl = new URL(avatarUrl, "http://localhost:8000").href;
    console.log("[resolveAvatarUrl] built full URL →", fullUrl);
    return fullUrl;
  } catch (err) {
    console.log(
      "[resolveAvatarUrl] URL constructor threw, falling back to raw avatarUrl →",
      avatarUrl
    );
    return avatarUrl;
  }
}
