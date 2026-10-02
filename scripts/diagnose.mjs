import http from "node:http";

const paths = [
  "/",
  "/preview/site-v2",
  "/preview/site-v2/",
  "/solucoes",
  "/segmentos",
  "/planos",
  "/conteudo",
  "/sobre"
];

for (const p of paths) {
  try {
    const res = await new Promise((resolve, reject) => {
      http.get(`http://127.0.0.1:3102${p}`, (r) => {
        let data = "";
        r.on("data", (chunk) => (data += chunk));
        r.on("end", () => resolve({ statusCode: r.statusCode, data }));
      }).on("error", reject);
    });

    console.log(`Path: ${p} | Status: ${res.statusCode} | Length: ${res.data.length}`);
    const cssLinks = res.data.match(/<link[^>]+rel="stylesheet"[^>]+>/g) || [];
    console.log(`  CSS tags count: ${cssLinks.length}`, cssLinks);
  } catch (err) {
    console.error(`Path: ${p} failed:`, err.message);
  }
}
