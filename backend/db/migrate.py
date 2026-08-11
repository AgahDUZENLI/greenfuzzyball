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
    with conn.cursor() as cursor:
        # Get already applied migrations
        try:
            applied = get_applied_migrations(cursor)
        except psycopg2.errors.UndefinedTable:
            conn.rollback()
            # schema_migrations doesn't exist yet — create it
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS schema_migrations (
                    version     VARCHAR PRIMARY KEY,
                    applied_at  TIMESTAMP DEFAULT NOW()
                )
            """)
            conn.commit()
            applied = set()

        # Get all migration files sorted
        migration_files = sorted(migrations_dir.glob("*.sql"))

        for f in migration_files:
            version = f.stem  # filename without .sql

            if version in applied:
                print(f"  SKIP  {version}")
                continue

            print(f"  RUN   {version}")
            sql = f.read_text()

            try:
                cursor.execute(sql)
                cursor.execute(
                    "INSERT INTO schema_migrations (version) VALUES (%s)",
                    (version,)
                )
                conn.commit()
                print(f"  OK    {version}")
            except Exception as e:
                conn.rollback()
                print(f"  FAIL  {version}: {e}")
                raise

    conn.close()
    print("Migrations complete!")

if __name__ == "__main__":
    run_migrations()