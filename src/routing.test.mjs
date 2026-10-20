import assert from "node:assert/strict";
import test from "node:test";
import worker from "./index.mjs";

function mockAssets(pages) {
  const calls = [];
  return {
    calls,
    env: {
      ASSETS: {
        async fetch(request) {
          const url = new URL(request.url);
          calls.push({ method: request.method, pathname: url.pathname });
          const page = pages[url.pathname];
          if (!page) return new Response("missing", { status: 404 });
          if (page.redirect) {
            return new Response(null, {
              status: 307,
              headers: { Location: page.redirect },
            });
          }
          return new Response(page.body, {
            status: 200,
            headers: { "content-type": page.type ?? "text/html; charset=utf-8" },
          });
        },
      },
    },
  };
}

const pages = {
  "/": { body: "<title>Home</title>" },
  "/about/": { body: "<title>About</title>" },
  "/styles.css": { body: "body{}", type: "text/css" },
  "/fonts/ApfelGrotezk-Fett.woff2": { body: "font", type: "font/woff2" },
  "/showcases/merlin/": { body: "<title>Merlin</title>" },
  "/showcases/lamplighter/": { body: "<title>Lamplighter</title>" },
  "/showcases/connie/": { body: "<title>Connie</title>" },
};

async function get(env, url, method = "GET") {
  return worker.fetch(new Request(url, { method }), env);
}

test("apex and www pass the path straight through", async () => {
  const { env, calls } = mockAssets(pages);
  const home = await get(env, "https://pushtomain.xyz/");
  const about = await get(env, "https://www.pushtomain.xyz/about/");
  assert.equal(await home.text(), "<title>Home</title>");
  assert.equal(await about.text(), "<title>About</title>");
  assert.deepEqual(
    calls.map((call) => call.pathname),
    ["/", "/about/"],
  );
});

test("showcase hosts serve their walkthrough at the root and at other paths", async () => {
  const { env, calls } = mockAssets(pages);
  const root = await get(env, "https://merlin.pushtomain.xyz/");
  const deep = await get(env, "https://merlin.pushtomain.xyz/anything");
  const lamp = await get(env, "https://lamplighter.pushtomain.xyz/lookup");
  const connie = await get(env, "https://connie.pushtomain.xyz/");
  assert.equal(await root.text(), "<title>Merlin</title>");
  assert.equal(await deep.text(), "<title>Merlin</title>");
  assert.equal(await lamp.text(), "<title>Lamplighter</title>");
  assert.equal(await connie.text(), "<title>Connie</title>");
  assert.deepEqual(
    calls.map((call) => call.pathname),
    ["/showcases/merlin/", "/showcases/merlin/", "/showcases/lamplighter/", "/showcases/connie/"],
  );
});

test("host matching ignores case and a trailing dot", async () => {
  const { env } = mockAssets(pages);
  const upper = await get(env, "https://Merlin.pushtomain.xyz/");
  const dotted = await get(env, "https://lamplighter.pushtomain.xyz./");
  assert.equal(await upper.text(), "<title>Merlin</title>");
  assert.equal(await dotted.text(), "<title>Lamplighter</title>");
});

test("static files on a showcase host stay on their own path", async () => {
  const { env, calls } = mockAssets(pages);
  const css = await get(env, "https://merlin.pushtomain.xyz/styles.css");
  const font = await get(env, "https://merlin.pushtomain.xyz/fonts/ApfelGrotezk-Fett.woff2");
  assert.equal(css.headers.get("content-type"), "text/css");
  assert.equal(await font.text(), "font");
  assert.deepEqual(
    calls.map((call) => call.pathname),
    ["/styles.css", "/fonts/ApfelGrotezk-Fett.woff2"],
  );
});

test("showcase hosts reject methods other than GET and HEAD", async () => {
  const { env, calls } = mockAssets(pages);
  const response = await get(env, "https://merlin.pushtomain.xyz/", "POST");
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "GET, HEAD");
  assert.equal(calls.length, 0);
});

test("a directory redirect inside the showcase is followed once", async () => {
  const { env, calls } = mockAssets({
    "/showcases/merlin/": { redirect: "/showcases/merlin/index.html" },
    "/showcases/merlin/index.html": { body: "<title>Merlin file</title>" },
  });
  const response = await get(env, "https://merlin.pushtomain.xyz/");
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "<title>Merlin file</title>");
  assert.deepEqual(
    calls.map((call) => call.pathname),
    ["/showcases/merlin/", "/showcases/merlin/index.html"],
  );
});

test("an off-site redirect is not followed", async () => {
  const { env, calls } = mockAssets({
    "/showcases/merlin/": { redirect: "https://evil.example/phish" },
  });
  const response = await get(env, "https://merlin.pushtomain.xyz/");
  assert.equal(response.status, 404);
  assert.equal(calls.length, 1);
});
