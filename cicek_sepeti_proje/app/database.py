# app/database.py

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# DİKKAT: Şifreniz kısmına PostgreSQL kurulumunda belirlediğin şifreyi yaz.
# Genelde kullanıcı adı "postgres"tir, değiştirmediysen öyle kalsın.
# Format: postgresql://kullanici_adi:sifre@adres:port/veritabani_adi
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:1@localhost/ciceksepeti_app"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()