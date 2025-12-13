from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware 
from . import models
from .database import engine
# 👇 VENDOR ROUTER'INI BURAYA EKLEDİK
from .routers import auth, products, orders, reviews, favorites, vendor 

# Tabloları oluştur
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Çiçek Sepeti FastAPI Projesi", version="1.0.0")

# CORS Middleware (React ile iletişim için gerekli)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True, 
    allow_methods=["*"], 
    allow_headers=["*"], 
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(reviews.router)
app.include_router(favorites.router)
# 👇 KRİTİK EKSİK PARÇA: VENDOR ROUTER'I BURAYA EKLİYORUZ
app.include_router(vendor.router) 

@app.get("/")
def read_root():
    return {"message": "Çiçek Sepeti Projesi Çalışıyor!"}