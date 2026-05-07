import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import sql from "sql-template-tag";
import { z } from "zod";
import { many, none, tx } from "./queries";

const migrationsDir = join(process.cwd(), "migrations");

const migrationRowSchema = z.object({ name: z.string() });

export async function runMigrations() {
    await none(`
        CREATE TABLE IF NOT EXISTS _migrations (
            "name" TEXT PRIMARY KEY,
            "appliedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    `);

    const files = (await readdir(migrationsDir)).filter((f) => f.endsWith(".sql")).sort();
    const applied = await many(`SELECT "name" FROM _migrations`, migrationRowSchema);
    const appliedNames = new Set(applied.map((r) => r.name));

    for (const file of files) {
        if (appliedNames.has(file)) {
            console.log(`skip   ${file}`);
            continue;
        }
        const fileSql = await readFile(join(migrationsDir, file), "utf8");
        console.log(`apply  ${file}`);
        await tx(async () => {
            await none(fileSql);
            await none(sql`INSERT INTO _migrations ("name") VALUES (${file})`);
        });
    }
}
