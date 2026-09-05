from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables / .env file.

    Only DATABASE_URL is required for the current PostgreSQL foundation phase.
    Additional settings (SECRET_KEY, JWT config, etc.) will be added when
    authentication is introduced.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",  # silently ignore unknown env vars
    )

    DATABASE_URL: str

    # Authentication
    SECRET_KEY: str = "super-secret-default-key-please-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # FastAPI application metadata
    APP_NAME: str = "CareerOS API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False

    # CORS: comma-separated list of allowed origins
    ALLOWED_ORIGINS: str = "http://localhost:3000,https://career-os-5txu.vercel.app"

    @property
    def allowed_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]


# Module-level singleton — import this everywhere
settings = Settings()
