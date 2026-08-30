import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const allowedContentTypes = ["text/html", "text/plain", "text/markdown"];
const maxRedirects = 4;
const maxResponseBytes = 2 * 1024 * 1024;
const requestTimeoutMs = 8_000;

export type RetrievedUrlSource = {
  content: string;
  finalUrl: string;
  mimeType: string;
  title?: string;
};

function decodeHtmlEntities(value: string) {
  const entities: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    hellip: "…",
    laquo: "«",
    lt: "<",
    nbsp: " ",
    quot: '"',
    raquo: "»"
  };

  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity: string) => {
    if (entity.startsWith("#")) {
      const hexadecimal = entity[1]?.toLowerCase() === "x";
      const codePoint = Number.parseInt(entity.slice(hexadecimal ? 2 : 1), hexadecimal ? 16 : 10);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
    }

    return entities[entity.toLowerCase()] ?? match;
  });
}

export function extractUsefulHtml(html: string) {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? decodeHtmlEntities(titleMatch[1].replace(/<[^>]+>/g, " ")) : undefined;
  const content = decodeHtmlEntities(
    html
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<(script|style|noscript|svg|canvas|nav|header|footer|form|iframe)[^>]*>[\s\S]*?<\/\1>/gi, " ")
      .replace(/<(br|\/p|\/div|\/section|\/article|\/li|\/h[1-6])\s*>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return {
    content,
    title: title?.replace(/\s+/g, " ").trim() || undefined
  };
}

function isPrivateIpv4(address: string) {
  const parts = address.split(".").map(Number);
  const [first, second] = parts;

  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 192 && second === 0) ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 198 && (second === 18 || second === 19)) ||
    (first === 198 && second === 51) ||
    (first === 203 && second === 0) ||
    first >= 224
  );
}

function isPrivateIpv6(address: string) {
  const normalized = address.toLowerCase().split("%")[0];

  if (normalized === "::" || normalized === "::1") {
    return true;
  }

  if (
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fec") ||
    normalized.startsWith("fed") ||
    normalized.startsWith("fee") ||
    normalized.startsWith("fef") ||
    normalized.startsWith("ff") ||
    normalized.startsWith("2001:db8") ||
    /^fe[89ab]/.test(normalized)
  ) {
    return true;
  }

  const mappedIpv4 = normalized.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1];
  return mappedIpv4 ? isPrivateIpv4(mappedIpv4) : false;
}

export function isPrivateAddress(address: string) {
  const version = isIP(address);
  return version === 4 ? isPrivateIpv4(address) : version === 6 ? isPrivateIpv6(address) : true;
}

export function parsePublicHttpUrl(value: string) {
  if (value.trim().length > 2048) {
    throw new Error("Cette URL est trop longue.");
  }

  let url: URL;

  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("Saisissez une URL HTTP ou HTTPS valide.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Seules les URL HTTP et HTTPS sont autorisées.");
  }

  if (url.username || url.password) {
    throw new Error("Les URL contenant des identifiants ne sont pas autorisées.");
  }

  if (!url.hostname || url.hostname.toLowerCase() === "localhost" || url.hostname.endsWith(".localhost")) {
    throw new Error("Les adresses locales ou internes ne sont pas autorisées.");
  }

  return url;
}

async function assertPublicDestination(url: URL) {
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  const addresses = isIP(hostname)
    ? [{ address: hostname }]
    : await lookup(hostname, { all: true, verbatim: true }).catch(() => {
        throw new Error("Le nom de domaine de cette source est introuvable.");
      });

  if (addresses.length === 0 || addresses.some(({ address }) => isPrivateAddress(address))) {
    throw new Error("Les adresses locales, privées ou internes ne sont pas autorisées.");
  }
}

async function readLimitedBody(response: Response) {
  const declaredLength = Number(response.headers.get("content-length") ?? 0);

  if (declaredLength > maxResponseBytes) {
    throw new Error("La page dépasse la taille maximale autorisée de 2 Mo.");
  }

  if (!response.body) {
    throw new Error("La page n’a renvoyé aucun contenu exploitable.");
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      total += value.byteLength;
      if (total > maxResponseBytes) {
        await reader.cancel();
        throw new Error("La page dépasse la taille maximale autorisée de 2 Mo.");
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(total);
  let offset = 0;
  chunks.forEach((chunk) => {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  });

  return new TextDecoder("utf-8", { fatal: false }).decode(body);
}

export async function retrieveUrlSource(value: string): Promise<RetrievedUrlSource> {
  let currentUrl = parsePublicHttpUrl(value);

  for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount += 1) {
    await assertPublicDestination(currentUrl);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);
    let response: Response;

    try {
      response = await fetch(currentUrl, {
        headers: {
          Accept: "text/html,text/plain,text/markdown;q=0.9",
          "User-Agent": "ForgeSourceFetcher/1.0"
        },
        redirect: "manual",
        signal: controller.signal
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("La récupération de cette URL a expiré.");
      }

      throw new Error("Cette URL est inaccessible depuis Forge.");
    } finally {
      clearTimeout(timeout);
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location || redirectCount === maxRedirects) {
        throw new Error("Cette URL redirige trop de fois ou vers une destination invalide.");
      }

      currentUrl = parsePublicHttpUrl(new URL(location, currentUrl).toString());
      continue;
    }

    if (!response.ok) {
      throw new Error(`La page a répondu avec le statut HTTP ${response.status}.`);
    }

    const mimeType = response.headers.get("content-type")?.split(";")[0].trim().toLowerCase() ?? "";
    if (!allowedContentTypes.includes(mimeType)) {
      throw new Error("Cette URL ne renvoie pas une page HTML, un texte ou un document Markdown.");
    }

    const body = await readLimitedBody(response);
    const extracted = mimeType === "text/html" ? extractUsefulHtml(body) : { content: body.trim(), title: undefined };

    if (extracted.content.length < 40) {
      throw new Error("Forge n’a pas trouvé assez de contenu textuel utile sur cette page.");
    }

    return {
      content: extracted.content,
      finalUrl: currentUrl.toString(),
      mimeType,
      title: extracted.title
    };
  }

  throw new Error("Cette URL n’a pas pu être récupérée.");
}
