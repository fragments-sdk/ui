// A dependency-free static server for the built harness page, bound to a free local port.
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, sep } from "node:path";

const MIME_TYPES = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
]);

/**
 * Serve `root` on 127.0.0.1.
 * @param {string} root
 * @returns {Promise<{ url: string, close: () => Promise<void> }>}
 */
export async function startServer(root) {
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url ?? "/", "http://local").pathname);
      const relative = normalize(pathname === "/" ? "/index.html" : pathname).replace(
        /^[/\\]+/,
        ""
      );
      const file = join(root, relative);
      if (!file.startsWith(root + sep) && file !== root) {
        response.writeHead(403).end();
        return;
      }
      const info = await stat(file).catch(() => null);
      if (!info?.isFile()) {
        response.writeHead(404, { "content-type": "text/plain" }).end("Not found");
        return;
      }
      response.writeHead(200, {
        "content-type": MIME_TYPES.get(extname(file)) ?? "application/octet-stream",
        "cache-control": "no-store",
      });
      createReadStream(file).pipe(response);
    } catch (error) {
      response.writeHead(500, { "content-type": "text/plain" }).end(String(error));
    }
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Harness server has no port.");
  return {
    url: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise((resolve) => {
        server.closeAllConnections?.();
        server.close(() => resolve());
      }),
  };
}
