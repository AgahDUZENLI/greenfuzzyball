import psycopg2
from psycopg2 import pool
from config import settings

connection_pool = None

def init_db():
    global connection_pool
    connection_pool = psycopg2.pool.ThreadedConnectionPool(
        minconn=1,
        maxconn=10,
        dsn=settings.DATABASE_URL
    )
    print("Database connection pool created")

def get_db():
    conn = connection_pool.getconn()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        connection_pool.putconn(conn)

def close_db():
    global connection_pool
    if connection_pool:
        connection_pool.closeall()
        print("Database connection pool closed")