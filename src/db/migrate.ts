
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import { pool } from "../config/db";
import { logger } from "../config/logger";

async function main() {
  try {
    logger.info("🔄 Running migrations...");

    const db = drizzle(pool);

    await migrate(db, {
      migrationsFolder: "./drizzle",
    });

    logger.info("✅ Migrations applied successfully");
  } catch (err) {
    logger.error({ err }, "❌ Migration failed");
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
