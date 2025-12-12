from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database, oauth2
import random
import string
from datetime import datetime

router = APIRouter(prefix="/orders", tags=["Orders"])
get_db = database.get_db

def generate_tracking_code():
    return "SP-" + ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

# 1. SİPARİŞ OLUŞTUR
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_order(
    order_data: schemas.OrderCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    tracking_code = generate_tracking_code()
    
    new_order = models.Order(
        tracking_number=tracking_code,
        status="Sipariş Alındı",
        customer_id=current_user.id,
        product_id=order_data.product_id,
        receiver_name=order_data.receiver_name,
        receiver_phone=order_data.receiver_phone,
        receiver_address=order_data.receiver_address,
        card_note=order_data.card_note,
        delivery_date=order_data.delivery_date,
        order_date=datetime.utcnow()
    )
    
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return {"message": "Sipariş alındı", "tracking_number": tracking_code}

# 2. SİPARİŞLERİMİ GETİR
@router.get("/", response_model=List[schemas.OrderOut])
def get_my_orders(db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_user)):
    orders = db.query(models.Order).filter(models.Order.customer_id == current_user.id).all()
    return orders

# 3. KARGO TAKİP (İŞTE BU EKSİKTİ!) 👇
@router.get("/track/{tracking_number}", response_model=schemas.OrderOut)
def track_order(tracking_number: str, db: Session = Depends(get_db)):
    # Takip koduna göre ara
    order = db.query(models.Order).filter(models.Order.tracking_number == tracking_number).first()
    if not order:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı")
    return order