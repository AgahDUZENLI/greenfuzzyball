"""Applies pending SQL migrations from backend/db/migrations/ in order, tracking
progress in a schema_migrations table. Run before the app server starts."""
import os

import psycopg2

from config import settings

MIGRATIONS_DIR = os.path.dirname(os.path.abspath(__file__)) + "/migrations"
ADVISORY_LOCK_KEY = 72179  # arbitrary constant shared by all backend instances


def run():
    conn = psycopg2.connect(settings.DATABASE_URL)
    conn.autocommit = False
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT pg_advisory_lock(%s)", (ADVISORY_LOCK_KEY,))
        conn.commit()

        with conn.cursor() as cur:
            cur.execute("""
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.tables
                    WHERE table_name = 'schema_migrations'
                )
            """)
            tracking_table_existed = cur.fetchone()[0]

            cur.execute("""
                CREATE TABLE IF NOT EXISTS schema_migrations (
                    filename   TEXT PRIMARY KEY,
                    applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
                )
            """)
        conn.commit()

        if not tracking_table_existed:
            _baseline_pre_existing_database(conn)

        filenames = sorted(f for f in os.listdir(MIGRATIONS_DIR) if f.endswith(".sql"))

        with conn.cursor() as cur:
            cur.execute("SELECT filename FROM schema_migrations")
            applied = {row[0] for row in cur.fetchall()}

        pending = [f for f in filenames if f not in applied]
        if not pending:
            print("No pending migrations")
            return

        for filename in pending:
            with open(os.path.join(MIGRATIONS_DIR, filename)) as f:
                sql = f.read()
            with conn.cursor() as cur:
                cur.execute(sql)
                cur.execute(
                    "INSERT INTO schema_migrations (filename) VALUES (%s)", (filename,)
                )
            conn.commit()
            print(f"Applied migration {filename}")
    finally:
        conn.rollback()
        with conn.cursor() as cur:
            cur.execute("SELECT pg_advisory_unlock(%s)", (ADVISORY_LOCK_KEY,))
        conn.commit()
        conn.close()


def _baseline_pre_existing_database(conn):
    """Marks the original migrations as already-applied for databases that were
    provisioned before this runner existed (via postgres's docker-entrypoint-initdb.d),
    so they aren't re-run against a database that already has their tables/seed data."""
    with conn.cursor() as cur:
        cur.execute("""
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables WHERE table_name = 'users'
            )
        """)
        pre_existing = cur.fetchone()[0]

    if not pre_existing:
        return

    baseline_files = ["001_initial_schema.sql", "002_seed_data.sql"]
    with conn.cursor() as cur:
        for filename in baseline_files:
            cur.execute(
                "INSERT INTO schema_migrations (filename) VALUES (%s) "
                "ON CONFLICT (filename) DO NOTHING",
                (filename,),
            )
    conn.commit()
    print(f"Baselined pre-existing database: {', '.join(baseline_files)} marked as applied")


if __name__ == "__main__":
    run()
