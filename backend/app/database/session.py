from sqlmodel import SQLModel, create_engine
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine
from sqlalchemy.orm import sessionmaker
from ..config import settings

DATABASE_URL = settings.DATABASE_URL

# Async engine using asyncpg
engine: AsyncEngine = create_async_engine(DATABASE_URL, echo=False, future=True)

async_session = sessionmaker(
    engine, expire_on_commit=False, class_=AsyncSession
)

async def get_session() -> AsyncSession:
    async with async_session() as session:
        yield session


async def init_db():
    # Create tables if SQLModel metadata is used for create_all (not recommended for prod)
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
