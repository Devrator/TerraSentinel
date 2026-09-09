import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Environmental Monitoring Network"
    SIH_PROBLEM_STATEMENT: str = "SIH26178"
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    
    # Database: Defaults to PostgreSQL, with graceful fallback to SQLite for local zero-config evaluation
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:postgres@localhost:5432/environment_monitoring"
    )
    
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ]
    
    # Node offline threshold in seconds (configurable, default 30s)
    NODE_OFFLINE_THRESHOLD_SECONDS: int = int(os.getenv("NODE_OFFLINE_THRESHOLD_SECONDS", "30"))
    
    # Alert cooldown in seconds to prevent duplicate spam (default 30s)
    ALERT_COOLDOWN_SECONDS: int = int(os.getenv("ALERT_COOLDOWN_SECONDS", "30"))
    
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "yes")

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
