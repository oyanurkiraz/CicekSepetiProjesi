from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database, oauth2
from ..services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schemas.OrderOut)
def create_order(
    order: schemas.OrderCreate, 
    db: Session = Depends(database.get_db), 
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Yeni sipariş oluştur"""
    new_order = OrderService.create_order(db=db, order=order, customer_id=current_user.id)
    if not new_order:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")
    return new_order


@router.get("/", response_model=List[schemas.OrderOut])
def get_my_orders(
    db: Session = Depends(database.get_db), 
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Kullanıcının siparişlerini getir"""
    return OrderService.get_user_orders(db=db, user_id=current_user.id)


@router.get("/track/{tracking_number}", response_model=schemas.OrderOut)
def track_order(tracking_number: str, db: Session = Depends(database.get_db)):
    """Sipariş takibi"""
    order = OrderService.get_order_by_tracking(db=db, tracking_number=tracking_number)
    if not order:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı")
    return order