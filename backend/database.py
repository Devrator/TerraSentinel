import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.config import settings

logger = logging.getLogger("terrasentinal.database")

def get_engine(url: str):
    connect_args = {}
    if url.startswith("sqlite"):
        connect_args["check_same_thread"] = False
    elif url.startswith("postgresql"):
        connect_args["connect_timeout"] = 5
    return create_engine(url, connect_args=connect_args, pool_pre_ping=True, echo=False)

def init_db_engine():
    db_url = settings.DATABASE_URL
    # Render PostgreSQL provides URLs starting with postgres://, which SQLAlchemy 1.4/2.0 requires as postgresql://
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    try:
        eng = get_engine(db_url)
        with eng.connect() as conn:
            logger.info(f"Connected to primary database: {db_url.split('@')[-1]}")
        return eng
    except Exception as e:
        logger.warning(
            f"Primary database connection to '{db_url.split('@')[-1]}' failed ({e}). "
            "Using local SQLite database (sqlite:///./environment_monitoring.db) for zero-config operation."
        )
        return get_engine("sqlite:///./environment_monitoring.db")

engine = init_db_engine()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
