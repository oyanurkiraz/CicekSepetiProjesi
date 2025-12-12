from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database, oauth2

router = APIRouter(prefix="/favorites", tags=["Favorites"])
get_db = database.get_db

# Favorilere Ekle / Çıkar (Toggle Mantığı)
@router.post("/{product_id}")
def toggle_favorite(
    product_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    existing = db.query(models.Favorite).filter(
        models.Favorite.user_id == current_user.id,
        models.Favorite.product_id == product_id
    ).first()

    if existing:
        db.delete(existing) # Varsa çıkar
        db.commit()
        return {"message": "Favorilerden çıkarıldı", "status": "removed"}
    else:
        new_fav = models.Favorite(user_id=current_user.id, product_id=product_id)
        db.add(new_fav) # Yoksa ekle
        db.commit()
        return {"message": "Favorilere eklendi", "status": "added"}

# Favorilerimi Getir
@router.get("/", response_model=List[schemas.FavoriteOut])
def get_my_favorites(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    favs = db.query(models.Favorite).filter(models.Favorite.user_id == current_user.id).all()
    return favs