from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # 👈 BU YENİ
from . import models
from .database import engine
from .routers import auth, products, orders, reviews, favorites

# Tabloları oluştur
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Çiçek Sepeti FastAPI Projesi", version="1.0.0")

# 👇 CORS AYARLARI (REACT İLE KONUŞMASI İÇİN ŞART)
origins = [
    "http://localhost:3000", # React'in adresi
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # GET, POST, PUT, DELETE hepsine izin ver
    allow_headers=["*"],
)
# 👆 CORS BİTİŞ

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(reviews.router)
app.include_router(favorites.router)

@app.get("/")
def read_root():
    return {"message": "Çiçek Sepeti Projesi Çalışıyor!"}