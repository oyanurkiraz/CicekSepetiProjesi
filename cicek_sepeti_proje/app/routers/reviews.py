from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import schemas, database, crud, models
from . import auth

router = APIRouter(
    prefix="/reviews",
    tags=["Reviews"]
)

get_db = database.get_db

# 1. Yorum Yap (Sadece Müşteriler)
@router.post("/{product_id}", response_model=schemas.ReviewOut)
def create_review(
    product_id: int,
    review: schemas.ReviewCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Çiçekçi kendi ürününe yorum yapmasın, sadece müşteriler yapsın
    if current_user.role != "individual":
        raise HTTPException(status_code=403, detail="Sadece müşteriler yorum yapabilir.")

    # Ürün var mı diye kontrol edilebilir (İsteğe bağlı ama iyi olur)
    # Şimdilik direkt ekliyoruz.
    
    return crud.create_review(db=db, review=review, user_id=current_user.id, product_id=product_id)

# 2. Bir Ürünün Yorumlarını Gör (HERKES)
@router.get("/{product_id}", response_model=List[schemas.ReviewOut])
def read_reviews(product_id: int, db: Session = Depends(get_db)):
    return crud.get_reviews_by_product(db=db, product_id=product_id)