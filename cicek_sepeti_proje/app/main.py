from fastapi import FastAPI
from . import models
from .database import engine
# 👇 1. Router dosyasını import ediyoruz
from .routers import auth, products, orders, reviews

# Tabloları oluşturur
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Çiçek Sepeti FastAPI Projesi", version="1.0.0")

# 👇 2. Router'ı ana uygulamaya ekliyoruz (Bağlantıyı kuruyoruz)
app.include_router(auth.router)

# Diğerlerini şimdilik yorum satırı olarak bırakabilirsin veya açabilirsin:
app.include_router(products.router)
app.include_router(orders.router) 
app.include_router(reviews.router)

@app.get("/")
def read_root():
    return {"message": "Çiçek Sepeti Projesi Çalışıyor! API Dokümantasyonu için /docs adresine gidin."}