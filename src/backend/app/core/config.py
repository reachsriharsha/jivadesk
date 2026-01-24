"""Application configuration using Pydantic Settings"""
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings with automatic environment variable loading and validation.

    All settings can be configured via environment variables.
    For nested config structure, use double underscore notation in env vars.
    Example: DATABASE_URL=postgresql://...
    """

    # Application
    app_name: str = Field(default="JivaDesk", description="Application name")
    debug: bool = Field(default=False, description="Debug mode flag")

    # Database
    database_url: str = Field(
        default="postgresql+psycopg2://jivadesk:secret@127.0.0.1:5432/jivadesk",
        description="PostgreSQL database connection URL"
    )

    # JWT Authentication
    secret_key: str = Field(
        default="supersecretkey",
        description="Secret key for JWT token signing (change in production!)"
    )
    jwt_algorithm: str = Field(
        default="HS256",
        description="JWT signing algorithm"
    )
    access_token_expire_minutes: int = Field(
        default=60,
        description="Access token expiry time in minutes"
    )
    refresh_token_expire_days: int = Field(
        default=30,
        description="Refresh token expiry time in days"
    )

    # CORS
    cors_origins: list[str] = Field(
        default=[
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost",
            "http://127.0.0.1",
        ],
        description="Allowed CORS origins"
    )

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        """Parse CORS origins from comma-separated string or list."""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )


# Singleton instance - import this in your code
settings = Settings()
