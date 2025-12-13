from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import random
import string
from .. import models, schemas, database, oauth2

router = APIRouter(prefix="/orders", tags=["Orders"])
get_db = database.get_db

def generate_tracking_code():
    return "ORD-" + "".join(random.choices(string.digits, k=6))

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schemas.OrderOut)
def create_order(
    order: schemas.OrderCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(oauth2.get_current_user)
):
    product = db.query(models.Product).filter(models.Product.id == order.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")

    # Adres Çevirici: Frontend'den gelen adresi alıp receiver_address'e yaz
    # address veya receiver_address gelme ihtimaline karşı ikisini de kontrol ediyoruz.
    final_address = order.address if order.address else order.receiver_address
    if not final_address:
        final_address = "Adres Girilmedi"

    new_order = models.Order(
        customer_id=current_user.id, 
        product_id=order.product_id,
        tracking_number=generate_tracking_code(),
        status="Sipariş Alındı",
        
        receiver_name=order.receiver_name,
        receiver_phone=order.receiver_phone,
        receiver_address=final_address, # KURAL: receiver_address (Çift d)
        
        card_note=order.card_note,
        delivery_date=order.delivery_date
    )
    
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return new_order

@router.get("/", response_model=List[schemas.OrderOut])
def get_my_orders(db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_user)):
    # customer_id'ye göre filtrele
    return db.query(models.Order).filter(models.Order.customer_id == current_user.id).order_by(models.Order.id.desc()).all()

@router.get("/track/{tracking_number}", response_model=schemas.OrderOut)
def track_order(tracking_number: str, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.tracking_number == tracking_number).first()
    if not order:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı")
    return order