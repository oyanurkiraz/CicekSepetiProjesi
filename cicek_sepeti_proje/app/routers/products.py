from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas, database, oauth2
from ..services.product_service import ProductService

router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


@router.get("/", response_model=List[schemas.ProductOut])
def get_products(
    db: Session = Depends(database.get_db),
    search: Optional[str] = "",
    category: Optional[str] = None,
    city: Optional[str] = None,
    district: Optional[str] = None
):
    """Ürün listesi (filtreleme destekli)"""
    return ProductService.get_products(
        db=db,
        search=search,
        category=category,
        city=city,
        district=district
    )


@router.get("/{id}", response_model=schemas.ProductOut)
def get_product(id: int, db: Session = Depends(database.get_db)):
    """Tek bir ürün getir"""
    product = ProductService.get_product_by_id(db, product_id=id)
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")
    return product


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schemas.ProductOut)
def create_product(
    product: schemas.ProductCreate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Yeni ürün ekle"""
    return ProductService.create_product(db=db, product=product, seller_id=current_user.id)