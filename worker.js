import { initialProducts } from "./seed-products.js";

const SESSION_COOKIE = "ng_admin";
const SESSION_SECONDS = 8 * 60 * 60;
const MAX_REQUEST_BYTES = 1_800_000;
const TYPES = new Set([
  "griferias", "sanitarios", "aire-acondicionado", "aerotermia",
  "descalcificadores", "termos", "piscina", "outlet"
]);

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers }
  });
}

function readCookie(request, name) {
  const cookie = request.headers.get("Cookie") || "";
  for (const part of cookie.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return value.join("=");
  }
  return "";
}

function toBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64 + "=".repeat((4 - base64.length % 4) % 4));
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

async function signingKey(password) {
  return crypto.subtle.importKey("raw", new TextEncoder().encode(password), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

async function createSession(password) {
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = toBase64Url(new TextEncoder().encode(String(expires)));
  const signature = await crypto.subtle.sign("HMAC", await signingKey(password), new TextEncoder().encode(payload));
  return `${payload}.${toBase64Url(new Uint8Array(signature))}`;
}

async function hasSession(request, password) {
  const [payload, signature, extra] = readCookie(request, SESSION_COOKIE).split(".");
  if (!payload || !signature || extra) return false;
  try {
    const expires = Number(new TextDecoder().decode(fromBase64Url(payload)));
    if (!Number.isSafeInteger(expires) || expires <= Math.floor(Date.now() / 1000)) return false;
    return await crypto.subtle.verify("HMAC", await signingKey(password), fromBase64Url(signature), new TextEncoder().encode(payload));
  } catch {
    return false;
  }
}

function sameOrigin(request, url) {
  return request.headers.get("Origin") === url.origin;
}

function validateProduct(input) {
  if (!input || typeof input !== "object") return "Datos de producto no válidos.";
  if (typeof input.name !== "string" || !input.name.trim() || input.name.trim().length > 120) return "El nombre es obligatorio y debe tener como máximo 120 caracteres.";
  if (!TYPES.has(input.type)) return "Selecciona un tipo de producto válido.";
  if (typeof input.image !== "string" || input.image.length > 1_500_000) return "La imagen no es válida o supera el límite permitido.";
  if (!input.descriptions || ["es", "ca", "en", "de"].some(lang => typeof input.descriptions[lang] !== "string" || !input.descriptions[lang].trim() || input.descriptions[lang].length > 1200)) return "Completa las descripciones en los cuatro idiomas.";
  return "";
}

function rowToProduct(row) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    active: Boolean(row.active),
    image: row.image || "",
    descriptions: { es: row.description_es, ca: row.description_ca, en: row.description_en, de: row.description_de },
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function readProducts(env, includeInactive) {
  const query = includeInactive
    ? "SELECT * FROM products ORDER BY updated_at DESC"
    : "SELECT * FROM products WHERE active = 1 ORDER BY updated_at DESC";
  const result = await env.DB.prepare(query).all();
  return result.results.map(rowToProduct);
}

async function seedIfEmpty(env) {
  const count = await env.DB.prepare("SELECT COUNT(*) AS total FROM products").first("total");
  if (count !== 0) return;
  const now = new Date().toISOString();
  await env.DB.batch(initialProducts.map(product => env.DB.prepare(
    "INSERT OR IGNORE INTO products (id, name, type, active, image, description_es, description_ca, description_en, description_de, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(product.id, product.name, product.type, product.active ? 1 : 0, product.image, product.descriptions.es, product.descriptions.ca, product.descriptions.en, product.descriptions.de, now, now)));
}

async function api(request, env, url) {
  const path = url.pathname;
  if (["/api/login", "/api/logout", "/api/auth"].includes(path) || path.startsWith("/api/products")) {
    if (typeof env.ADMIN_PASSWORD !== "string" || env.ADMIN_PASSWORD.length < 16) {
      return json({ error: "La contraseña privada aún no está configurada. Añade el secreto ADMIN_PASSWORD en Cloudflare." }, 503);
    }
  }
  if (path === "/api/login" && request.method === "POST") {
    if (!sameOrigin(request, url)) return json({ error: "Origen no permitido." }, 403);
    let body;
    try { body = await request.json(); } catch { return json({ error: "Solicitud no válida." }, 400); }
    if (typeof body.password !== "string" || body.password.length > 512 || body.password !== env.ADMIN_PASSWORD) return json({ error: "Contraseña incorrecta." }, 401);
    const token = await createSession(env.ADMIN_PASSWORD);
    return json({ ok: true }, 200, { "set-cookie": `${SESSION_COOKIE}=${token}; Path=/; Max-Age=${SESSION_SECONDS}; HttpOnly; Secure; SameSite=Strict` });
  }
  if (path === "/api/logout" && request.method === "POST") {
    if (!sameOrigin(request, url)) return json({ error: "Origen no permitido." }, 403);
    return json({ ok: true }, 200, { "set-cookie": `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict` });
  }
  if (path === "/api/auth" && request.method === "GET") {
    return await hasSession(request, env.ADMIN_PASSWORD) ? json({ ok: true }) : json({ error: "Inicia sesión para gestionar productos." }, 401);
  }
  if (path === "/api/products" && request.method === "GET") {
    await seedIfEmpty(env);
    const includeInactive = url.searchParams.get("all") === "1";
    if (includeInactive && !(await hasSession(request, env.ADMIN_PASSWORD))) return json({ error: "Inicia sesión para ver el catálogo completo." }, 401);
    return json(await readProducts(env, includeInactive));
  }

  if (path.startsWith("/api/products")) {
    if (!sameOrigin(request, url)) return json({ error: "Origen no permitido." }, 403);
    if (!(await hasSession(request, env.ADMIN_PASSWORD))) return json({ error: "Tu sesión ha caducado. Inicia sesión de nuevo." }, 401);
    if (!["POST", "PUT", "DELETE"].includes(request.method)) return json({ error: "Método no permitido." }, 405, { allow: "GET, POST, PUT, DELETE" });
    if (Number(request.headers.get("Content-Length") || 0) > MAX_REQUEST_BYTES) return json({ error: "La solicitud supera el tamaño permitido." }, 413);
    const id = decodeURIComponent(path.slice("/api/products/".length));
    if (request.method === "DELETE") {
      if (!id) return json({ error: "Falta el identificador del producto." }, 400);
      await env.DB.prepare("DELETE FROM products WHERE id = ?").bind(id).run();
      return json({ ok: true });
    }

    let input;
    try { input = await request.json(); } catch { return json({ error: "Solicitud no válida." }, 400); }
    const issue = validateProduct(input);
    if (issue) return json({ error: issue }, 400);
    const now = new Date().toISOString();
    const descriptions = input.descriptions;
    if (request.method === "POST") {
      const productId = crypto.randomUUID();
      await env.DB.prepare("INSERT INTO products (id, name, type, active, image, description_es, description_ca, description_en, description_de, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .bind(productId, input.name.trim(), input.type, input.active ? 1 : 0, input.image, descriptions.es.trim(), descriptions.ca.trim(), descriptions.en.trim(), descriptions.de.trim(), now, now).run();
      return json({ id: productId }, 201);
    }
    if (!id) return json({ error: "Falta el identificador del producto." }, 400);
    const result = await env.DB.prepare("UPDATE products SET name = ?, type = ?, active = ?, image = ?, description_es = ?, description_ca = ?, description_en = ?, description_de = ?, updated_at = ? WHERE id = ?")
      .bind(input.name.trim(), input.type, input.active ? 1 : 0, input.image, descriptions.es.trim(), descriptions.ca.trim(), descriptions.en.trim(), descriptions.de.trim(), now, id).run();
    if (!result.meta.changes) return json({ error: "No se encontró ese producto." }, 404);
    return json({ ok: true });
  }

  return json({ error: "Ruta no encontrada." }, 404);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    try {
      if (url.pathname.startsWith("/api/")) return await api(request, env, url);
      return env.ASSETS.fetch(request);
    } catch (error) {
      console.error("Nou Grampo Worker error", error);
      return json({ error: "No se pudo completar la solicitud." }, 500);
    }
  }
};
