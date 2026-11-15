/**
 * Applies the SQL migrations in drizzle/ to whichever database is configured.
 *
 *   npm run db:migrate
 *
 * Do not run this while `npm run dev` is up if you are on PGlite — both
 * processes open the same store and corrupt it. See src/db/index.ts.
 */
import { getDb, usingPostgres } from '../src/db';

async function main() {
  const db = await getDb();
  console.log(`Migrating ${usingPostgres() ? 'Postgres' : 'PGlite (.pglite/)'}`);

  if (usingPostgres()) {
    const { migrate } = await import('drizzle-orm/postgres-js/migrator');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await migrate(db as any, { migrationsFolder: './drizzle' });
  } else {
    const { migrate } = await import('drizzle-orm/pglite/migrator');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await migrate(db as any, { migrationsFolder: './drizzle' });
  }

  console.log('Migrations applied.');
}

main().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
