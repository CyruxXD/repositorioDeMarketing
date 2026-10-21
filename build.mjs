/**
 * Build de MarketingWeb para Cloudflare Pages.
 *
 *  1. Compila Tailwind (src/input.css -> css/tailwind.css)
 *  2. Copia a dist/ solo lo que la web necesita servir
 *
 * Configurar en Cloudflare Pages:
 *   Build command:      npm run build
 *   Build output dir:   dist
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DIST = path.join(ROOT, "dist");

function run(cmd, args) {
  console.log(`> ${cmd} ${args.join(" ")}`);
  execFileSync(cmd, args, { stdio: "inherit", cwd: ROOT });
}

// 1. Tailwind
// Se invoca con `node <cli>` en vez de `npx tailwindcss` porque el bit de
// ejecucion de node_modules/.bin puede no venir seteado en un clone fresco.
const TAILWIND_CLI = path.join(ROOT, "node_modules", "tailwindcss", "lib", "cli.js");
if (fs.existsSync(TAILWIND_CLI)) {
  run(process.execPath, [
    TAILWIND_CLI,
    "-i", "src/input.css",
    "-o", "css/tailwind.css",
    "--minify",
  ]);
} else {
  run("npx", ["tailwindcss", "-i", "src/input.css", "-o", "css/tailwind.css", "--minify"]);
}

// 2. Limpiar dist
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

// 3. Copiar archivos de la raiz
const ROOT_FILES = ["index.html", "quienes somos.html", "informacion de la web.txt"];
const ROOT_DIRS = ["css", "recursos"];

for (const f of ROOT_FILES) {
  const src = path.join(ROOT, f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(DIST, f));
    console.log(`  + ${f}`);
  }
}

for (const d of ROOT_DIRS) {
  const src = path.join(ROOT, d);
  if (!fs.existsSync(src)) continue;
  fs.cpSync(src, path.join(DIST, d), {
    recursive: true,
    // Los .mp4 estan fuera del repo (.gitignore). En Cloudflare no existen,
    // asi que se omiten en vez de romper el build. En local, si estan, se copian.
    filter: (s) => !s.endsWith(".mp4"),
  });
  console.log(`  + ${d}/`);
}

// 4. Verificacion: ningun archivo puede superar los 25 MiB de Cloudflare Pages
const LIMIT = 25 * 1024 * 1024;
let count = 0;
let max = 0;
let biggest = "";
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else {
      const size = fs.statSync(p).size;
      count++;
      if (size > max) {
        max = size;
        biggest = path.relative(DIST, p);
      }
      if (size > LIMIT) {
        throw new Error(
          `Archivo demasiado grande para Cloudflare Pages (>25 MiB): ${path.relative(DIST, p)} (${(size / 1048576).toFixed(1)} MiB)`
        );
      }
    }
  }
})(DIST);

console.log(`\nBuild OK: ${count} archivos, mayor = ${(max / 1048576).toFixed(2)} MiB (${biggest})`);
