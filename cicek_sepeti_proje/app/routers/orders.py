from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import schemas, database, crud, models
from . import auth

router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)

get_db = database.get_db

# 1. Sipariş Ver (SADECE BİREYSEL MÜŞTERİLER)
@router.post("/", response_model=schemas.OrderOut)
def create_order(
    order: schemas.OrderCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Çiçekçi kendi kendine sipariş veremesin :)
    if current_user.role != "individual":
        raise HTTPException(status_code=403, detail="Sadece müşteriler sipariş verebilir.")
    
    return crud.create_order(db=db, order=order, user_id=current_user.id)

# 2. Siparişlerimi Gör (Müşteri kendi siparişini görür)
@router.get("/", response_model=List[schemas.OrderOut])
def read_my_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return crud.get_my_orders(db=db, user_id=current_user.id)

# 3. Sipariş Takibi (HERKES ERİŞEBİLİR - GİRİŞ GEREKMEZ)
@router.get("/track/{tracking_number}", response_model=schemas.OrderOut)
def track_order(tracking_number: str, db: Session = Depends(get_db)):
    order = crud.get_order_by_tracking(db, tracking_number=tracking_number)
    
    if not order:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı. Lütfen kodu kontrol edin.")
        
    return order
# 4. Satıcı: Bana Gelen Siparişleri Listele
@router.get("/incoming", response_model=List[schemas.OrderOut])
def read_incoming_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Sadece çiçekçiler görebilir
    if current_user.role != "corporate":
        raise HTTPException(status_code=403, detail="Bu sayfayı sadece çiçekçiler görebilir.")
        
    return crud.get_orders_for_seller(db=db, seller_id=current_user.id)

# 5. Satıcı: Sipariş Durumunu Güncelle (Örn: Yola Çıktı)
@router.put("/{order_id}/status", response_model=schemas.OrderOut)
def update_status(
    order_id: int, 
    status: str, # Query parametresi olarak gelecek (Örn: ?status=Yola Çıktı)
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != "corporate":
        raise HTTPException(status_code=403, detail="Sadece çiçekçiler durum güncelleyebilir.")
    
    # Güvenlik için: Satıcı başkasının siparişini güncelleyemesin diye kontrol eklenebilir
    # Ama şimdilik basit tutuyoruz.
    
    updated_order = crud.update_order_status(db=db, order_id=order_id, new_status=status)
    if not updated_order:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı.")
        
    return updated_order