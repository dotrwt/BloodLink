"""
Blood Link — SQLAlchemy Database Engine & Session Factory
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings

# ── Engine ───────────────────────────────────────────────────────────────────
_connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    _connect_args["check_same_thread"] = False

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,           # test connections before handing them out
    echo=settings.DEBUG,          # log SQL when DEBUG=True
    connect_args=_connect_args,
)

# ── Session factory ──────────────────────────────────────────────────────────
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# ── Base class for all ORM models ─────────────────────────────────────────────
class Base(DeclarativeBase):
    pass


# ── FastAPI dependency ────────────────────────────────────────────────────────
def get_db():
    """Yield a database session and ensure it is closed after use."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables (called from main.py on startup)."""
    # Import models so Base is aware of them before create_all
    from app.database import models  # noqa: F401
    Base.metadata.create_all(bind=engine)

    if settings.DATABASE_URL.startswith("sqlite"):
        import sqlite3
        db_file = settings.DATABASE_URL.replace("sqlite:///", "").replace("sqlite://", "")
        if db_file.startswith("./"):
            db_file = db_file[2:]
        try:
            with sqlite3.connect(db_file) as conn:
                cur = conn.cursor()
                def _add_col(t, col, def_):
                    cur.execute(f"PRAGMA table_info({t})")
                    if col not in [r[1] for r in cur.fetchall()]:
                        cur.execute(f"ALTER TABLE {t} ADD COLUMN {col} {def_}")

                _add_col("blood_requests", "patient_name", "VARCHAR(150)")
                _add_col("blood_requests", "emergency_contact", "VARCHAR(30)")
                _add_col("blood_requests", "city", "VARCHAR(100)")
                _add_col("blood_requests", "area", "VARCHAR(100)")
                _add_col("blood_inventory", "safe_threshold", "INTEGER DEFAULT 5")
                conn.commit()
        except Exception:
            pass
