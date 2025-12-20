from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas


class ReviewService:
    """Yorum işlemleri için service sınıfı"""
    
    @staticmethod
    def get_product_reviews(db: Session, product_id: int) -> List[models.Review]:
        """Bir ürünün yorumlarını getirme"""
        return db.query(models.Review).filter(
            models.Review.product_id == product_id
        ).all()
    
    @staticmethod
    def has_purchased_product(db: Session, user_id: int, product_id: int) -> bool:
        """Kullanıcının ürünü satın alıp almadığını kontrol et"""
        order = db.query(models.Order).filter(
            models.Order.customer_id == user_id,
            models.Order.product_id == product_id
        ).first()
        return order is not None
    
    @staticmethod
    def has_existing_review(db: Session, user_id: int, product_id: int) -> bool:
        """Kullanıcının bu ürün için zaten yorum yapıp yapmadığını kontrol et"""
        existing = db.query(models.Review).filter(
            models.Review.user_id == user_id,
            models.Review.product_id == product_id
        ).first()
        return existing is not None
    
    @staticmethod
    def create_review(
        db: Session,
        review: schemas.ReviewCreate,
        user_id: int
    ) -> models.Review:
        """Yeni yorum oluşturma"""
        new_review = models.Review(user_id=user_id, **review.dict())
        db.add(new_review)
        db.commit()
        db.refresh(new_review)
        return new_review
