import os
import psycopg2
from pathlib import Path

# Connect to database
conn = psycopg2.connect(
    host=os.getenv("POSTGRES_HOST", "postgres"),
    port=os.getenv("POSTGRES_PORT", "5432"),
    dbname=os.getenv("POSTGRES_DB", "greenfuzzyball"),
    user=os.getenv("POSTGRES_USER", "greenfuzzyball"),
    password=os.getenv("POSTGRES_PASSWORD", "greenfuzzyball123")
)

migrations_dir = Path(__file__).parent / "migrations"

def get_applied_migrations(cursor):
    cursor.execute("""
        SELECT version FROM schema_migrations ORDER BY version
    """)
    return {row[0] for row in cursor.fetchall()}

def run_migrations():
    migration_files = sorted(migrations_dir.glob("*.sql"))

    with conn.cursor() as cursor:
        try:
            applied = get_applied_migrations(cursor)
        except psycopg2.errors.UndefinedTable:
            conn.rollback()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS schema_migrations (
                    version     VARCHAR PRIMARY KEY,
                    applied_at  TIMESTAMP DEFAULT NOW()
                )
            """)
            conn.commit()
            applied = set()

            # Check if tables already exist (existing database)
            cursor.execute("""
                SELECT COUNT(*) FROM information_schema.tables
                WHERE table_schema = 'public' AND table_name = 'users'
            """)
            users_exists = cursor.fetchone()[0] > 0

            if users_exists:
                # Mark all existing migration files as already applied
                for f in migration_files:
                    cursor.execute(
                        "INSERT INTO schema_migrations (version) VALUES (%s) ON CONFLICT DO NOTHING",
                        (f.stem,)
                    )
                conn.commit()
                print("Existing database detected — marked all migrations as applied")
                applied = get_applied_migrations(cursor)

        pending = [f for f in migration_files if f.stem not in applied]

        if not pending:
            print("No pending migrations")
            return

        for f in pending:
            print(f"Applying migration {f.stem}")
            cursor.execute(f.read_text())
            cursor.execute(
                "INSERT INTO schema_migrations (version) VALUES (%s)",
                (f.stem,)
            )
            conn.commit()

        print(f"Applied {len(pending)} migration(s)")

if __name__ == "__main__":
    run_migrations()