import Fastify from "fastify";
import { createReadableStream, render, html, delayed } from "./utils.js";

const app = Fastify({
  logger: true,
});

const template = () => html`<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>Prueba Streaming</title>
    </head>
    <body>
      <h1>Prueba streaming</h1>
      <div>
        <template shadowrootmode="open">
          <slot name="contenido">Cargando...</slot>
        </template>

        ${delayed(2000, html`<div slot="contenido">Contenido streameado</div>`)}
      </div>
    </body>
  </html>`;

app.get("/", async (_, reply) => {
  reply.header("Content-Type", "text/html");

  const htmlStream = createReadableStream(render(template()));

  return reply.send(htmlStream);
});

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await app.listen({ port });
    console.log(`Server is running on http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
