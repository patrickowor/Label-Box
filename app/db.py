import os

from typing import AsyncIterator
from sqlalchemy.ext.asyncio import  create_async_engine, async_scoped_session
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel
from dotenv import load_dotenv
from asyncio import current_task

load_dotenv()
DATABASE_URL = os.environ.get("DATABASE_URL")

print()

engine = create_async_engine(DATABASE_URL, echo=False, future=True)
async_session = async_scoped_session(
    sessionmaker(
        engine, 
        class_=AsyncSession, 
        expire_on_commit=False
    ),
    scopefunc=current_task
)

async def init_db():
    async with engine.begin() as conn:
        # await conn.run_sync(SQLModel.metadata.drop_all)
        await conn.run_sync(SQLModel.metadata.create_all)


async def get_session() -> AsyncIterator[AsyncSession]:
    async with async_session() as session:
        yield session
