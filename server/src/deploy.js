import { spawn } from "node:child_process";
import { request, createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const frontendPort = 4100;
const apiPort = 4101;
const children = [];
let shuttingDown = false;

function startProcess(name, args, cwd, env) {
  const child = spawn(process.execPath, args, {
    cwd,
    env: { ...process.env, ...env },
    stdio: "inherit",
  });
  children.push(child);

  child.on("error", (error) => {
    console.error(`${name} failed to start.`, error);
    shutdown(1);
  });
  child.on("exit", (code, signal) => {
    if (!shuttingDown) {
      console.error(`${name} exited unexpectedly (${signal ?? code}).`);
      shutdown(code || 1);
    }
  });
}

function proxyRequest(req, res, port) {
  const proxy = request(
    {
      hostname: "127.0.0.1",
      port,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        host: req.headers.host ?? "localhost",
        "x-forwarded-host":
          req.headers["x-forwarded-host"] ?? req.headers.host ?? "localhost",
      },
    },
    (upstream) => {
      res.writeHead(upstream.statusCode ?? 502, upstream.headers);
      upstream.pipe(res);
    },
  );

  proxy.on("error", (error) => {
    console.error(`Proxy request to port ${port} failed.`, error);
    if (!res.headersSent) {
      res.writeHead(502, { "content-type": "text/plain; charset=utf-8" });
      res.end("Service temporarily unavailable.");
    } else {
      res.destroy(error);
    }
  });

  req.pipe(proxy);
}

const server = createServer((req, res) => {
  const isApiRequest =
    req.url?.startsWith("/api/") ||
    req.url === "/api" ||
    req.url?.startsWith("/uploads/products/");
  proxyRequest(req, res, isApiRequest ? apiPort : frontendPort);
});

function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  process.exitCode = exitCode;
  server.close();
  for (const child of children) child.kill("SIGTERM");
  const timeout = setTimeout(() => process.exit(exitCode), 10_000);
  timeout.unref();
}

process.on("SIGINT", () => shutdown());
process.on("SIGTERM", () => shutdown());

startProcess(
  "Storefront",
  [path.join(repositoryRoot, "client/.output/server/index.mjs")],
  repositoryRoot,
  { HOST: "127.0.0.1", PORT: String(frontendPort) },
);
startProcess(
  "API",
  ["src/index.js"],
  path.join(repositoryRoot, "server"),
  { HOST: "127.0.0.1", PORT: String(apiPort) },
);

const publicPort = Number(process.env.PORT ?? 4000);
server.listen(publicPort, "0.0.0.0", () => {
  console.log(`NovaShop storefront and API listening on port ${publicPort}.`);
});
