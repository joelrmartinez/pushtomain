// Host routing for the two showcase subdomains.
// Apex and www stay on the static site: hand the request to the asset binding
// and do nothing else. Showcase hosts serve one walkthrough page, plus the
// shared CSS, fonts, and images that page needs.

const SHOWCASES = {
  "merlin.pushtomain.xyz": "merlin",
  "lamplighter.pushtomain.xyz": "lamplighter",
};

const STATIC_FILE = /\.(?:css|js|mjs|map|woff2?|ttf|otf|png|jpe?g|gif|webp|svg|ico|txt|xml|webmanifest)$/i;

export default {
  async fetch(request, env) {
    try {
      return await route(request, env);
    } catch (error) {
      // A routing bug must not take the marketing site down with it.
      console.error(
        JSON.stringify({
          event: "showcase_route_error",
          message: error instanceof Error ? error.message : "unknown",
        }),
      );
      return env.ASSETS.fetch(request);
    }
  },
};

async function route(request, env) {
  const url = new URL(request.url);
  const slug = SHOWCASES[normalizeHost(url.hostname)];

  if (!slug) {
    return env.ASSETS.fetch(request);
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method not allowed", {
      status: 405,
      headers: { Allow: "GET, HEAD" },
    });
  }

  if (STATIC_FILE.test(url.pathname)) {
    return env.ASSETS.fetch(request);
  }

  return fetchShowcase(request, env, slug);
}

async function fetchShowcase(request, env, slug) {
  const assetUrl = new URL(request.url);
  assetUrl.pathname = `/showcases/${slug}/`;
  assetUrl.search = "";
  assetUrl.hash = "";

  let response = await env.ASSETS.fetch(new Request(assetUrl, request));
  if (isRedirect(response)) {
    const next = safeShowcaseLocation(assetUrl, response.headers.get("Location"));
    if (!next) {
      return new Response("Not found", { status: 404 });
    }
    response = await env.ASSETS.fetch(new Request(next, request));
  }
  return response;
}

function isRedirect(response) {
  return response.status >= 300 && response.status < 400;
}

function safeShowcaseLocation(base, location) {
  if (!location) return null;
  const next = new URL(location, base);
  if (next.origin !== base.origin) return null;
  if (!next.pathname.startsWith("/showcases/")) return null;
  return next;
}

function normalizeHost(hostname) {
  return hostname.toLowerCase().replace(/\.$/, "");
}
