/** Auth destinations must stay on this origin, including after URL normalization. */
export function getSafeNextPath(value?: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u0020\u007f]/.test(value)) return "/app";
  try {
    const url = new URL(value, "https://learnit.invalid");
    if (url.origin !== "https://learnit.invalid") return "/app";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/app";
  }
}
