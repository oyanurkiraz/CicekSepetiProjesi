from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database, oauth2

router = APIRouter(
    prefix="/reviews",
    tags=["Reviews"]
)

get_db = database.get_db

# 1. BİR ÜRÜNÜN YORUMLARINI GETİR
@router.get("/", response_model=List[schemas.ReviewOut])
def get_reviews(product_id: int, db: Session = Depends(get_db)):
    reviews = db.query(models.Review).filter(models.Review.product_id == product_id).all()
    return reviews

# 2. YENİ YORUM EKLE (Sadece Satın Alanlar!)
@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schemas.ReviewOut)
def create_review(
    review: schemas.ReviewCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user) # Giriş yapmış kullanıcı
):
    # KURAL: Kullanıcı bu ürünü satın almış mı?
    # Not: Senin Order modelinde product_id olduğunu varsayıyorum (Basit yapı)
    # Eğer OrderItem tablosu kullanıyorsan burası değişmeli.
    
    has_purchased = db.query(models.Order).filter(
        models.Order.user_id == current_user.id,
        models.Order.product_id == review.product_id
    ).first()

    if not has_purchased:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu ürünü satın almadığınız için yorum yapamazsınız."
        )

    # Daha önce yorum yapmış mı? (Opsiyonel: Her ürüne 1 yorum hakkı)
    existing_review = db.query(models.Review).filter(
        models.Review.user_id == current_user.id,
        models.Review.product_id == review.product_id
    ).first()

    if existing_review:
        raise HTTPException(status_code=400, detail="Bu ürün için zaten bir yorumunuz var.")

    # Yorumu Kaydet
    new_review = models.Review(user_id=current_user.id, **review.dict())
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    
    return new_review