from sqlalchemy.orm import Session
from typing import List, Tuple
from .. import models


class FavoriteService:
    """Favori işlemleri için service sınıfı"""
    
    @staticmethod
    def toggle_favorite(db: Session, user_id: int, product_id: int) -> Tuple[str, str]:
        """
        Favori ekle/çıkar (toggle mantığı)
        Returns: (message, status) tuple
        """
        existing = db.query(models.Favorite).filter(
            models.Favorite.user_id == user_id,
            models.Favorite.product_id == product_id
        ).first()
        
        if existing:
            db.delete(existing)
            db.commit()
            return ("Favorilerden çıkarıldı", "removed")
        else:
            new_fav = models.Favorite(user_id=user_id, product_id=product_id)
            db.add(new_fav)
            db.commit()
            return ("Favorilere eklendi", "added")
    
    @staticmethod
    def get_user_favorites(db: Session, user_id: int) -> List[models.Favorite]:
        """Kullanıcının favorilerini getirme"""
        return db.query(models.Favorite).filter(
            models.Favorite.user_id == user_id
        ).all()
