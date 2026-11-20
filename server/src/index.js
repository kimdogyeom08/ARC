import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import pg from "pg";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createSessionToken, hashPassword, isValidPassword, normalizeUsername, verifyPassword, verifySessionToken } from "./auth.js";

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env") });

const { Pool } = pg;
const app = express();

function readPort(name) {
  const value = process.env[name];
  if (value === undefined || value === "") return undefined;
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${name} must be an integer between 1 and 65535.`);
  }
  return port;
}

const port = readPort("PORT") ?? 3001;
const databasePort = readPort("DB_PORT");
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ...(databasePort === undefined ? {} : { port: databasePort }),
    })
  : null;
const authSecret = process.env.AUTH_SECRET;

app.use(cors({ origin: process.env.UI_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", databaseConfigured: Boolean(pool), authConfigured: Boolean(authSecret && Buffer.byteLength(authSecret) >= 32) });
});

function requireDatabase(response) {
  if (!pool) {
    response.status(503).json({ error: "Database is not configured. Set DATABASE_URL in server/.env." });
    return false;
  }
  return true;
}

function requireAuthConfiguration(response) {
  if (!authSecret || Buffer.byteLength(authSecret) < 32) {
    response.status(503).json({ error: "Authentication is not configured. Set AUTH_SECRET in the API environment." });
    return false;
  }
  return true;
}

function requireAuth(request, response, next) {
  if (!requireAuthConfiguration(response)) return;
  const authorization = request.get("authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const user = verifySessionToken(token, authSecret);
  if (!user) {
    response.status(401).json({ error: "로그인이 만료되었습니다. 다시 로그인해 주세요." });
    return;
  }
  request.user = user;
  next();
}

function toBuild(row) {
  return {
    id: String(row.id),
    champion: row.champion_id,
    path: row.primary_path,
    secondary: row.secondary_path,
    keystone: row.keystone,
    primaryRunes: row.primary_runes,
    secondaryRunes: row.secondary_runes,
    shards: row.shards,
    skillOrder: row.skill_order,
    items: row.items,
    lane: row.lane,
    date: row.created_at.toLocaleDateString("ko-KR"),
  };
}

const buildColumns = "id, champion_id, primary_path, keystone, primary_runes, secondary_path, secondary_runes, shards, skill_order, items, lane, created_at";

app.post("/api/auth/register", async (request, response, next) => {
  if (!requireDatabase(response) || !requireAuthConfiguration(response)) return;
  const username = normalizeUsername(request.body?.username);
  const password = request.body?.password;
  if (!username) {
    response.status(400).json({ error: "이름은 공백을 제외하고 2~32자로 입력해 주세요." });
    return;
  }
  if (!isValidPassword(password)) {
    response.status(400).json({ error: "비밀번호는 8자 이상, 128바이트 이하여야 합니다." });
    return;
  }

  try {
    const passwordHash = await hashPassword(password);
    const { rows } = await pool.query(
      "INSERT INTO users (username, username_key, password_hash) VALUES ($1, $2, $3) RETURNING id, username",
      [username.username, username.usernameKey, passwordHash],
    );
    const user = { id: String(rows[0].id), username: rows[0].username };
    response.status(201).json({ user, token: createSessionToken(user, authSecret) });
  } catch (error) {
    if (error.code === "23505") {
      response.status(409).json({ error: "이미 사용 중인 이름입니다." });
      return;
    }
    next(error);
  }
});

app.post("/api/auth/login", async (request, response, next) => {
  if (!requireDatabase(response) || !requireAuthConfiguration(response)) return;
  const username = normalizeUsername(request.body?.username);
  const password = request.body?.password;
  if (!username || typeof password !== "string") {
    response.status(401).json({ error: "이름 또는 비밀번호가 올바르지 않습니다." });
    return;
  }

  try {
    const { rows } = await pool.query(
      "SELECT id, username, password_hash FROM users WHERE username_key = $1",
      [username.usernameKey],
    );
    if (!rows.length || !await verifyPassword(password, rows[0].password_hash)) {
      response.status(401).json({ error: "이름 또는 비밀번호가 올바르지 않습니다." });
      return;
    }
    const user = { id: String(rows[0].id), username: rows[0].username };
    response.json({ user, token: createSessionToken(user, authSecret) });
  } catch (error) {
    next(error);
  }
});

app.get("/api/auth/me", requireAuth, (request, response) => {
  response.json({ id: request.user.id, username: request.user.username });
});

app.get("/api/builds", requireAuth, async (request, response, next) => {
  if (!requireDatabase(response)) return;
  try {
    const { rows } = await pool.query(
      `SELECT ${buildColumns} FROM builds WHERE user_id = $1 ORDER BY created_at DESC`,
      [request.user.id],
    );
    response.json(rows.map(toBuild));
  } catch (error) {
    next(error);
  }
});

app.post("/api/builds", requireAuth, async (request, response, next) => {
  if (!requireDatabase(response)) return;
  const { champion, path, secondary, keystone, primaryRunes, secondaryRunes, shards, skillOrder = [], items = [], lane } = request.body ?? {};
  const isStringArray = (value, length) => Array.isArray(value) && value.length === length && value.every((item) => typeof item === "string");
  if (
    typeof champion !== "string" || !champion.trim() ||
    typeof path !== "string" || !path.trim() ||
    typeof secondary !== "string" || !secondary.trim() ||
    typeof keystone !== "string" ||
    !isStringArray(primaryRunes, 3) ||
    !isStringArray(secondaryRunes, 2) ||
    !isStringArray(shards, 3) ||
    !Array.isArray(skillOrder) || !skillOrder.every((item) => typeof item === "string") ||
    !Array.isArray(items) || !items.every((item) => typeof item === "string") ||
    (lane !== null && lane !== undefined && typeof lane !== "string")
  ) {
    response.status(400).json({ error: "Build data is incomplete or invalid." });
    return;
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO builds (user_id, champion_id, primary_path, keystone, primary_runes, secondary_path, secondary_runes, shards, skill_order, items, lane)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING ${buildColumns}`,
      [request.user.id, champion, path, keystone, primaryRunes, secondary, secondaryRunes, shards, skillOrder, items, lane || null],
    );
    response.status(201).json(toBuild(rows[0]));
  } catch (error) {
    next(error);
  }
});

app.delete("/api/builds/:id", requireAuth, async (request, response, next) => {
  if (!requireDatabase(response)) return;
  const id = request.params.id;
  if (!/^[1-9]\d*$/.test(id)) {
    response.status(400).json({ error: "Build id must be a positive integer." });
    return;
  }
  try {
    const result = await pool.query("DELETE FROM builds WHERE id = $1 AND user_id = $2", [id, request.user.id]);
    if (result.rowCount === 0) {
      response.status(404).json({ error: "Build not found." });
      return;
    }
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.use((error, _request, response, _next) => {
  console.error("Unhandled API error", error);
  response.status(500).json({ error: "An unexpected API error occurred." });
});

app.listen(port, () => {
  console.log(`ARC API listening at http://localhost:${port}`);
});
