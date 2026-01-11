if (!self.define) {
  let e,
    s = {};
  const a = (a, c) => (
    (a = new URL(a + ".js", c).href),
    s[a] ||
      new Promise((s) => {
        if ("document" in self) {
          const e = document.createElement("script");
          (e.src = a), (e.onload = s), document.head.appendChild(e);
        } else (e = a), importScripts(a), s();
      }).then(() => {
        let e = s[a];
        if (!e) throw new Error(`Module ${a} didn’t register its module`);
        return e;
      })
  );
  self.define = (c, i) => {
    const n =
      e ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (s[n]) return;
    let t = {};
    const r = (e) => a(e, n),
      b = { module: { uri: n }, exports: t, require: r };
    s[n] = Promise.all(c.map((e) => b[e] || r(e))).then((e) => (i(...e), t));
  };
}
define(["./workbox-14aa2a4a"], function (e) {
  "use strict";
  importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: "/_next/dynamic-css-manifest.json",
          revision: "d751713988987e9331980363e24189ce",
        },
        {
          url: "/_next/static/chunks/0-8e604f789cc01ead.js",
          revision: "8e604f789cc01ead",
        },
        {
          url: "/_next/static/chunks/0ed3bff5-b20736be6fe589e8.js",
          revision: "b20736be6fe589e8",
        },
        {
          url: "/_next/static/chunks/212-709a19e2ba259f09.js",
          revision: "709a19e2ba259f09",
        },
        {
          url: "/_next/static/chunks/388-53aff2bf39a13b12.js",
          revision: "53aff2bf39a13b12",
        },
        {
          url: "/_next/static/chunks/42-e5339f2a64296a22.js",
          revision: "e5339f2a64296a22",
        },
        {
          url: "/_next/static/chunks/439-22c056c3e233bb97.js",
          revision: "22c056c3e233bb97",
        },
        {
          url: "/_next/static/chunks/480-970db1caac219029.js",
          revision: "970db1caac219029",
        },
        {
          url: "/_next/static/chunks/494.b9b55931a419d7a7.js",
          revision: "b9b55931a419d7a7",
        },
        {
          url: "/_next/static/chunks/763.db6ceecb248a03e0.js",
          revision: "db6ceecb248a03e0",
        },
        {
          url: "/_next/static/chunks/7eebee04-c722792b9e003ab8.js",
          revision: "c722792b9e003ab8",
        },
        {
          url: "/_next/static/chunks/848-d87d63566020c8b9.js",
          revision: "d87d63566020c8b9",
        },
        {
          url: "/_next/static/chunks/a7e16ef1-e1065f613435e400.js",
          revision: "e1065f613435e400",
        },
        {
          url: "/_next/static/chunks/ff393d78-b9e9efa6e373b4c5.js",
          revision: "b9e9efa6e373b4c5",
        },
        {
          url: "/_next/static/chunks/framework-40cb57ba376e14cb.js",
          revision: "40cb57ba376e14cb",
        },
        {
          url: "/_next/static/chunks/main-5bf2010ef4118b03.js",
          revision: "5bf2010ef4118b03",
        },
        {
          url: "/_next/static/chunks/pages/Home-f6cc48a2846e60cc.js",
          revision: "f6cc48a2846e60cc",
        },
        {
          url: "/_next/static/chunks/pages/Inicio-e0b9b6f2aca033b1.js",
          revision: "e0b9b6f2aca033b1",
        },
        {
          url: "/_next/static/chunks/pages/_app-520d87554bf7172b.js",
          revision: "520d87554bf7172b",
        },
        {
          url: "/_next/static/chunks/pages/_error-aee272889249d737.js",
          revision: "aee272889249d737",
        },
        {
          url: "/_next/static/chunks/pages/acao-f149e0e8222cd56b.js",
          revision: "f149e0e8222cd56b",
        },
        {
          url: "/_next/static/chunks/pages/admin-3ad4addb8fdd5f0c.js",
          revision: "3ad4addb8fdd5f0c",
        },
        {
          url: "/_next/static/chunks/pages/admin.films-b10ecac0eaece211.js",
          revision: "b10ecac0eaece211",
        },
        {
          url: "/_next/static/chunks/pages/animes-ec2e6c65f617166f.js",
          revision: "ec2e6c65f617166f",
        },
        {
          url: "/_next/static/chunks/pages/aplicativos/%5Bid%5D-870ca470c706db2a.js",
          revision: "870ca470c706db2a",
        },
        {
          url: "/_next/static/chunks/pages/chat-6ef60558cd84beaf.js",
          revision: "6ef60558cd84beaf",
        },
        {
          url: "/_next/static/chunks/pages/chat/%5BchatId%5D-bf528f7b0a2d6b69.js",
          revision: "bf528f7b0a2d6b69",
        },
        {
          url: "/_next/static/chunks/pages/chat/invites-19aa5745e675afac.js",
          revision: "19aa5745e675afac",
        },
        {
          url: "/_next/static/chunks/pages/comedia-e7d3a04839ed928a.js",
          revision: "e7d3a04839ed928a",
        },
        {
          url: "/_next/static/chunks/pages/configuracoes-79599ecd5c96ea41.js",
          revision: "79599ecd5c96ea41",
        },
        {
          url: "/_next/static/chunks/pages/feedback-9dc7733501b4bd1e.js",
          revision: "9dc7733501b4bd1e",
        },
        {
          url: "/_next/static/chunks/pages/idfilmes-bf223391322442bb.js",
          revision: "bf223391322442bb",
        },
        {
          url: "/_next/static/chunks/pages/idseries-c1074b8969013b0d.js",
          revision: "c1074b8969013b0d",
        },
        {
          url: "/_next/static/chunks/pages/index-0b01ce518768dd6a.js",
          revision: "0b01ce518768dd6a",
        },
        {
          url: "/_next/static/chunks/pages/iptv-461a6dffa10ae4ca.js",
          revision: "461a6dffa10ae4ca",
        },
        {
          url: "/_next/static/chunks/pages/loja-6655b6c56676b542.js",
          revision: "6655b6c56676b542",
        },
        {
          url: "/_next/static/chunks/pages/mais-opcoes-b9a624d6a38cf98c.js",
          revision: "b9a624d6a38cf98c",
        },
        {
          url: "/_next/static/chunks/pages/migracao-a39a4efb0bd5e05d.js",
          revision: "a39a4efb0bd5e05d",
        },
        {
          url: "/_next/static/chunks/pages/perfil.admin-7a075d5e89312a13.js",
          revision: "7a075d5e89312a13",
        },
        {
          url: "/_next/static/chunks/pages/series-d3a03c8eb3a256d5.js",
          revision: "d3a03c8eb3a256d5",
        },
        {
          url: "/_next/static/chunks/pages/terror-6f9b8eb07eb42bab.js",
          revision: "6f9b8eb07eb42bab",
        },
        {
          url: "/_next/static/chunks/polyfills-42372ed130431b0a.js",
          revision: "846118c33b2c0e922d7b3a7676f81f6f",
        },
        {
          url: "/_next/static/chunks/webpack-4deac77349fa4796.js",
          revision: "4deac77349fa4796",
        },
        {
          url: "/_next/static/css/9d9a794aa2da8c2c.css",
          revision: "9d9a794aa2da8c2c",
        },
        {
          url: "/_next/static/y-0wlF2gHnh49JGpbvfV3/_buildManifest.js",
          revision: "840dff7091efa11ae4077bdd3d394e87",
        },
        {
          url: "/_next/static/y-0wlF2gHnh49JGpbvfV3/_ssgManifest.js",
          revision: "b6652df95db52feb4daf4eca35380933",
        },
        { url: "/animacao.svg", revision: "e1604cc874bda54e8ded18ab9e920482" },
        { url: "/animado.svg", revision: "cabf7e58f4934f3df1f60122e24d2370" },
        { url: "/favicon.ico", revision: "c30c7d42707a47a3f4591831641e50dc" },
        { url: "/file.svg", revision: "d09f95206c3fa0bb9bd9fefabfd0ea71" },
        { url: "/globe.svg", revision: "2aaafa6a49b6563925fe440891e32717" },
        { url: "/logo.png", revision: "d0dae6579fe7cc771b9c43b0930f0657" },
        { url: "/manifest.json", revision: "31b1fef6781372f34538a747150b1f6e" },
        { url: "/next.svg", revision: "8e061864f388b47f33a1c3780831193e" },
        { url: "/planeta.svg", revision: "a52009aea6f9e18ed3d0487ab3a7f503" },
        { url: "/vercel.svg", revision: "c0af2f507b369b085b35ef4bbe3bcf1e" },
        { url: "/window.svg", revision: "a2760511c65806022ad20adf74370ff3" },
      ],
      { ignoreURLParametersMatching: [] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      "/",
      new e.NetworkFirst({
        cacheName: "start-url",
        plugins: [
          {
            cacheWillUpdate: async ({
              request: e,
              response: s,
              event: a,
              state: c,
            }) =>
              s && "opaqueredirect" === s.type
                ? new Response(s.body, {
                    status: 200,
                    statusText: "OK",
                    headers: s.headers,
                  })
                : s,
          },
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /_next\/static\/chunks\/.*\.(js|css)/,
      new e.CacheFirst({
        cacheName: "static-chunks-cache",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 2592e3 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /_next\/static\/media\/.*\.(jpg|jpeg|png|svg|webp|gif)/,
      new e.CacheFirst({
        cacheName: "static-media-cache",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 2592e3 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /^https:\/\/fonts\.googleapis\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: "google-fonts-cache",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 31536e3 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /^https:\/\/fonts\.googleapis\.com\/css2\?family=.*/i,
      new e.StaleWhileRevalidate({
        cacheName: "google-fonts-css-cache",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 31536e3 }),
        ],
      }),
      "GET"
    );
});
