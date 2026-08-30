import assert from "node:assert/strict";
import test from "node:test";

import {
  extractUsefulHtml,
  isPrivateAddress,
  parsePublicHttpUrl,
  retrieveUrlSource
} from "../lib/forge-ai/url-source";

test("refuse localhost and non-http protocols", () => {
  assert.throws(() => parsePublicHttpUrl("http://localhost:3000/admin"), /locales ou internes/);
  assert.throws(() => parsePublicHttpUrl("file:///etc/passwd"), /HTTP et HTTPS/);
});

test("detects private IPv4 and IPv6 destinations", () => {
  assert.equal(isPrivateAddress("127.0.0.1"), true);
  assert.equal(isPrivateAddress("10.20.30.40"), true);
  assert.equal(isPrivateAddress("192.168.1.2"), true);
  assert.equal(isPrivateAddress("::1"), true);
  assert.equal(isPrivateAddress("8.8.8.8"), false);
  assert.equal(isPrivateAddress("2606:4700:4700::1111"), false);
});

test("refuses a redirect from a public destination to a private address", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(null, {
    headers: { location: "http://127.0.0.1/internal" },
    status: 302
  });

  try {
    await assert.rejects(
      retrieveUrlSource("https://8.8.8.8/source"),
      /locales, privées ou internes/
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("extracts useful HTML and removes navigation and scripts", () => {
  const result = extractUsefulHtml(`
    <html>
      <head><title>Guide &amp; sécurité</title><style>.hidden{}</style></head>
      <body>
        <nav>Menu privé</nav>
        <main><h1>Préparer la sortie</h1><p>Vérifier la météo et le matériel.</p></main>
        <script>window.secret = true</script>
      </body>
    </html>
  `);

  assert.equal(result.title, "Guide & sécurité");
  assert.match(result.content, /Préparer la sortie/);
  assert.doesNotMatch(result.content, /Menu privé|window\.secret/);
});
