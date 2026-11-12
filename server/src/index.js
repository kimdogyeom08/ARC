import "dotenv/config";
import cors from "cors";
import express from "express";
import pg from "pg";

const { Pool } = pg;
const app = express();
const port = Number(process.env.PORT || 3001);
const pool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL }) : null;

app.use(cors({ origin: process.env.UI_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", databaseConfigured: Boolean(pool) });
});

app.get("/api/builds", async (_request, response, next) => {
  if (!pool) {
    response.status(503).json({ error: "Database is not configured. Set DATABASE_URL in server/.env." });
    return;
  }
  try {
    const { rows } = await pool.query("SELECT id, champion_id, primary_path, keystone, primary_runes, secondary_path, secondary_runes, shards, lane, created_at FROM builds ORDER BY created_at DESC");
    response.json(rows);
  } catch (error) {
    next(error);
  }
});

app.post("/api/builds", async (request, response, next) => {
  if (!pool) {
    response.status(503).json({ error: "Database is not configured. Set DATABASE_URL in server/.env." });
    return;
  }

  const { championId, primaryPath, keystone, primaryRunes, secondaryPath, secondaryRunes, shards, lane } = request.body ?? {};
  if (
    typeof championId !== "string" ||
    typeof primaryPath !== "string" ||
    typeof keystone !== "string" ||
    !Array.isArray(primaryRunes) ||
    primaryRunes.length !== 3 ||
    typeof secondaryPath !== "string" ||
    !Array.isArray(secondaryRunes) ||
    secondaryRunes.length !== 2 ||
    !Array.isArray(shards) ||
    shards.length !== 3 ||
    (lane !== null && lane !== undefined && typeof lane !== "string")
  ) {
    response.status(400).json({ error: "Build data is incomplete or invalid." });
    return;
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO builds (champion_id, primary_path, keystone, primary_runes, secondary_path, secondary_runes, shards, lane)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, champion_id, primary_path, keystone, primary_runes, secondary_path, secondary_runes, shards, lane, created_at`,
      [championId, primaryPath, keystone, primaryRunes, secondaryPath, secondaryRunes, shards, lane || null],
    );
    response.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/builds/:id", async (request, response, next) => {
  if (!pool) {
    response.status(503).json({ error: "Database is not configured. Set DATABASE_URL in server/.env." });
    return;
  }
  const id = Number(request.params.id);
  if (!Number.isInteger(id) || id < 1) {
    response.status(400).json({ error: "Build id must be a positive integer." });
    return;
  }
  try {
    const result = await pool.query("DELETE FROM builds WHERE id = $1", [id]);
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
