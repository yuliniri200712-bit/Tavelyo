// Servidor estático mínimo para la prueba de actualización de la PWA: sirve un build y permite
// cambiarlo por otro sin reiniciar, como un despliegue en el mismo origen. Sin dependencias.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import type { AddressInfo } from 'node:net';
import { extname, join, normalize, sep } from 'node:path';

const TYPES: Readonly<Record<string, string>> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
};

export interface StaticServer {
  readonly url: string;
  /** Cambia el build servido (el «despliegue» de una versión nueva). */
  serve(root: string): void;
  close(): Promise<void>;
}

export async function startStaticServer(initialRoot: string): Promise<StaticServer> {
  let root = initialRoot;
  const server = createServer(async (request, response) => {
    const path = decodeURIComponent(new URL(request.url ?? '/', 'http://x').pathname);
    const file = normalize(join(root, path));
    if (!file.startsWith(normalize(root) + sep) && file !== normalize(root)) {
      response.writeHead(403).end();
      return;
    }
    const candidates = extname(file) ? [file] : [join(root, 'index.html')];
    for (const candidate of candidates) {
      try {
        const body = await readFile(candidate);
        response.writeHead(200, {
          'Content-Type': TYPES[extname(candidate)] ?? 'application/octet-stream',
          // Como en producción: el navegador revalida sw.js e index.html en cada comprobación.
          'Cache-Control': 'no-cache',
        });
        response.end(body);
        return;
      } catch {
        // Siguiente candidato.
      }
    }
    response.writeHead(404).end();
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  return {
    url: `http://127.0.0.1:${port}`,
    serve: (next) => {
      root = next;
    },
    close: () => new Promise((resolve) => server.close(() => resolve())),
  };
}
