from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "AgenteAgro"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "supersecretkey" # Change in production
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8 # 8 days
    
    DATABASE_URL: str = "sqlite+aiosqlite:///./agenteagro.db"

    @field_validator("DATABASE_URL")
    @classmethod
    def assemble_db_connection(cls, v: Optional[str]) -> str:
        if not v:
            return v
        if v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql+asyncpg://", 1)
        if v.startswith("postgresql://") and "asyncpg" not in v:
            return v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v

    OPENAI_API_KEY: str = ""
    WHATSAPP_VERIFY_TOKEN: str = "agenteagro_token"
    WHATSAPP_ACCESS_TOKEN: Optional[str] = None
    WHATSAPP_NUMBER_ID: Optional[str] = None
    
    # AWS S3 / MinIO
    AWS_ACCESS_KEY_ID: str = "minioadmin"
    AWS_SECRET_ACCESS_KEY: str = "minioadmin"
    AWS_REGION: str = "us-east-1"
    S3_BUCKET_NAME: str = "agenteagro-images"
    
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

settings = Settings()
