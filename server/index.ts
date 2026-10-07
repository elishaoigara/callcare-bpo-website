import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { handlePayment, type PaymentAction } from "./payments/http.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.all(
    "/api/payments/:action",
    express.raw({ type: "application/json", limit: "64kb" }),
    async (req, res) => {
      if (
        !["order", "checkout", "verify", "webhook"].includes(req.params.action)
      ) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers))
        if (typeof value === "string") headers.set(key, value);
      const request = new Request(`http://localhost${req.originalUrl}`, {
        method: req.method,
        headers,
        ...(!["GET", "HEAD"].includes(req.method)
          ? {
              body:
                req.body instanceof Buffer
                  ? new Uint8Array(req.body)
                  : new Uint8Array(),
            }
          : {}),
      });
      const result = await handlePayment(
        request,
        req.params.action as PaymentAction
      );
      result.headers.forEach((value, key) => res.setHeader(key, value));
      res.status(result.status).send(await result.text());
    }
  );

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Known routes have generated entrypoints; preserve a real 404 for missing URLs.
  app.get("*", (_req, res) => {
    res.status(404).sendFile(path.join(staticPath, "404.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
