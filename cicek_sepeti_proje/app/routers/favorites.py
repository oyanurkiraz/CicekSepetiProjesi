from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database, oauth2
from ..services.favorite_service import FavoriteService

router = APIRouter(prefix="/favorites", tags=["Favorites"])


@router.post("/{product_id}")
def toggle_favorite(
    product_id: int, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Favorilere ekle/çıkar (toggle)"""
    message, status = FavoriteService.toggle_favorite(
        db=db, user_id=current_user.id, product_id=product_id
    )
    return {"message": message, "status": status}


@router.get("/", response_model=List[schemas.FavoriteOut])
def get_my_favorites(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Kullanıcının favorilerini getir"""
    return FavoriteService.get_user_favorites(db=db, user_id=current_user.id)