import os

class Settings:
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")
    TIME_SCALE_FACTOR = float(os.getenv("TIME_SCALE_FACTOR", "1.0"))
    PLAYER_ACTION_LIMIT = int(os.getenv("PLAYER_ACTION_LIMIT", "10"))

settings = Settings()
