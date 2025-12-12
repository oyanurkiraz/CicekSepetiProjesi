from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas, database, oauth2  # 👈 OAUTH2 BURAYA EKLENDİ!

router = APIRouter(
    prefix="/products",
    tags=["Products"]
)

get_db = database.get_db

# GELİŞMİŞ ARAMA (Şehir, İlçe, Kategori, İsim)
@router.get("/", response_model=List[schemas.ProductOut])
def get_products(
    db: Session = Depends(get_db),
    search: Optional[str] = "",
    category: Optional[str] = None,
    city: Optional[str] = None,      # Şehir Filtresi
    district: Optional[str] = None   # İlçe Filtresi
):
    # Ürünleri ve Satıcılarını birleştirerek sorgula
    query = db.query(models.Product).join(models.User).filter(models.Product.is_active == True)
    
    # 1. Kategori Filtresi
    if category:
        query = query.filter(models.Product.category == category)

    # 2. Şehir ve İlçe Filtresi
    if city:
        query = query.filter(models.User.city == city)
    if district:
        query = query.filter(models.User.district == district)

    # 3. İsim Arama
    if search:
        query = query.filter(models.Product.name.ilike(f"%{search}%"))
    
    return query.all()

# TEK BİR ÜRÜN GETİR
@router.get("/{id}", response_model=schemas.ProductOut)
def get_product(id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")
    return product

# YENİ ÜRÜN EKLE
@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schemas.ProductOut)
def create_product(
    product: schemas.ProductCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user) # Artık hata vermeyecek
):
    # Ürünü ekleyen kişi satıcıdır
    new_product = models.Product(**product.dict(), seller_id=current_user.id)
    
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product