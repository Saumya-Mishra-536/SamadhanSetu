from pydantic import BaseSettings, Field

class Settings(BaseSettings):
    FASTAPI_HOST: str = Field("0.0.0.0", env="FASTAPI_HOST")
    FASTAPI_PORT: int = Field(8000, env="FASTAPI_PORT")

    POSTGRES_USER: str = Field(..., env="POSTGRES_USER")
    POSTGRES_PASSWORD: str = Field(..., env="POSTGRES_PASSWORD")
    POSTGRES_DB: str = Field(..., env="POSTGRES_DB")
    POSTGRES_HOST: str = Field("db", env="POSTGRES_HOST")
    POSTGRES_PORT: int = Field(5432, env="POSTGRES_PORT")

    DATABASE_URL: str = Field(..., env="DATABASE_URL")

    OPENAI_API_KEY: str | None = Field(None, env="OPENAI_API_KEY")
    OPENAI_API_BASE: str | None = Field(None, env="OPENAI_API_BASE")

    FRONTEND_URL: str = Field("http://localhost:3000", env="FRONTEND_URL")

    APP_ENV: str = Field("development", env="APP_ENV")

    class Config:
        env_file = ".env"

settings = Settings()
