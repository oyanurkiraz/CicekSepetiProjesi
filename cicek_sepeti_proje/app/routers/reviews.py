from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database, oauth2
from ..services.review_service import ReviewService

router = APIRouter(
    prefix="/reviews",
    tags=["Reviews"]
)


@router.get("/", response_model=List[schemas.ReviewOut])
def get_reviews(product_id: int, db: Session = Depends(database.get_db)):
    """Bir ürünün yorumlarını getir"""
    return ReviewService.get_product_reviews(db=db, product_id=product_id)


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schemas.ReviewOut)
def create_review(
    review: schemas.ReviewCreate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Yeni yorum ekle (sadece satın alanlar)"""
    # Satın alma kontrolü
    if not ReviewService.has_purchased_product(db, user_id=current_user.id, product_id=review.product_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu ürünü satın almadığınız için yorum yapamazsınız."
        )
    
    # Mevcut yorum kontrolü
    if ReviewService.has_existing_review(db, user_id=current_user.id, product_id=review.product_id):
        raise HTTPException(
            status_code=400, 
            detail="Bu ürün için zaten bir yorumunuz var."
        )
    
    return ReviewService.create_review(db=db, review=review, user_id=current_user.id)