from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database

router = APIRouter(
    prefix="/products",
    tags=["Products"]
)

get_db = database.get_db

# 1. TÜM ÜRÜNLERİ GETİR
# DÜZELTME: schemas.Product -> schemas.ProductOut
@router.get("/", response_model=List[schemas.ProductOut])
def get_products(db: Session = Depends(get_db)):
    # Filtreyi kaldırdık, ne var ne yoksa getirsin
    products = db.query(models.Product).all() 
    return products
# 2. TEK BİR ÜRÜN GETİR
# DÜZELTME: schemas.Product -> schemas.ProductOut
@router.get("/{id}", response_model=schemas.ProductOut)
def get_product(id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")
    return product

# 3. YENİ ÜRÜN EKLE
# DÜZELTME: Response model schemas.ProductOut yapıldı
@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schemas.ProductOut)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    new_product = models.Product(**product.dict())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product