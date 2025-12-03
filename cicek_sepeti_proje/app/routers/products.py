from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional # <--- Düzeltme: Optional buraya eklendi
from .. import schemas, database, crud, models
from . import auth 

router = APIRouter(
    prefix="/products",
    tags=["Products"]
)

get_db = database.get_db

# 1. Tüm Çiçekleri Listele (Şehir ve İlçe Filtreli)
@router.get("/", response_model=List[schemas.ProductOut])
def read_products(
    skip: int = 0, 
    limit: int = 100, 
    city: Optional[str] = None,      # İsteğe bağlı şehir filtresi
    district: Optional[str] = None,  # İsteğe bağlı ilçe filtresi
    db: Session = Depends(get_db)
):
    # crud.py içindeki güncellediğimiz fonksiyonu çağırıyoruz
    products = crud.get_products(db, skip=skip, limit=limit, city=city, district=district)
    return products

# 2. Çiçek Ekle (SADECE KURUMSAL ÜYELER)
@router.post("/", response_model=schemas.ProductOut)
def create_product(
    product: schemas.ProductCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user) # Giriş yapmış mı?
):
    # Kullanıcı satıcı (corporate) mı kontrol et
    if current_user.role != "corporate":
        raise HTTPException(status_code=403, detail="Sadece kurumsal üyeler (çiçekçiler) ürün ekleyebilir.")
    
    return crud.create_product(db=db, product=product, seller_id=current_user.id)