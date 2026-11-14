from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    FASTAPI_HOST: str = "0.0.0.0"
    FASTAPI_PORT: int = 8000
    POSTGRES_USER: str = "ss_user"
    POSTGRES_PASSWORD: str = "ss_password"
    POSTGRES_DB: str = "ss_db"
    POSTGRES_HOST: str = "db"
    POSTGRES_PORT: int = 5432
    DATABASE_URL: str = "postgresql+asyncpg://ss_user:ss_password@db:5432/ss_db"
    OPENAI_API_KEY: str | None = None
    OPENAI_API_BASE: str | None = None
    FRONTEND_URL: str = "http://localhost:5173"
    APP_ENV: str = "development"
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
