from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_ENV: str = "development"
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    DATABASE_PATH: str = "data/samadhan.db"
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
