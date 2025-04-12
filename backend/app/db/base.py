from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy import Column, Integer, DateTime, func
from typing import Generator
from fastapi import Depends
import datetime

from app.core import config

Base = declarative_base()

# class CustomBase:
#     @declared_attr
#     def __tablename__(cls):
#         return cls.__name__.lower()

#     id = Column(Integer, primary_key=True, index=True)
#     created_at = Column(DateTime, default=datetime.datetime.utcnow)
#     updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class Database:
    def __init__(self):
        # Convert the DATABASE_URL to use asyncpg driver
        db_url = config.DATABASE_URL
        if db_url.startswith('postgresql://'):
            db_url = db_url.replace('postgresql://', 'postgresql+asyncpg://')
        
        self.engine = create_async_engine(
            db_url,
            echo=False,
            future=True
        )
        self.SessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=self.engine,
            class_=AsyncSession,
            expire_on_commit=False
        )

database = Database()

async def get_db() -> Generator:
    async with database.SessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise