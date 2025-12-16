from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from .. import models, schemas, database, oauth2

router = APIRouter(prefix="/vendor", tags=["Vendor"])
get_db = database.get_db

# 1. ÇİÇEKÇİNİN ÜRÜNLERİ
@router.get("/products", response_model=List[schemas.ProductOut])
def get_my_products(db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_user)):
    if current_user.role != "corporate":
        raise HTTPException(status_code=403, detail="Yetkisiz")
    return db.query(models.Product).filter(models.Product.seller_id == current_user.id).all()

# 2. GELEN SİPARİŞLER
@router.get("/orders", response_model=List[schemas.OrderOut])
def get_incoming_orders(db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_user)):
    if current_user.role != "corporate":
        raise HTTPException(status_code=403, detail="Yetkisiz")
    
    # Satıcının ürünlerine ait siparişler - Product ilişkisini eager load et
    orders = db.query(models.Order)\
               .options(joinedload(models.Order.product))\
               .join(models.Product, models.Order.product_id == models.Product.id)\
               .filter(models.Product.seller_id == current_user.id)\
               .order_by(models.Order.id.desc())\
               .all()
    return orders

# 3. DURUM GÜNCELLEME
@router.put("/orders/{id}/status")
def update_order_status(id: int, status_text: str, db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_user)):
    order = db.query(models.Order).join(models.Product).filter(
        models.Order.id == id,
        models.Product.seller_id == current_user.id
    ).first()

    if not order:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı")
    
    order.status = status_text
    db.commit()
    return {"message": "Durum güncellendi", "status": status_text}

# 4. ÜRÜN SİL
@router.delete("/products/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(id: int, db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_user)):
    product = db.query(models.Product).filter(models.Product.id == id).first()
    if not product or product.seller_id != current_user.id:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")
    
    db.delete(product)
    db.commit()
    return

# 5. FİYAT GÜNCELLE
@router.put("/products/{id}/price")
def update_product_price(id: int, price: float, db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_user)):
    product = db.query(models.Product).filter(models.Product.id == id).first()
    if not product or product.seller_id != current_user.id:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")
        
    product.price = price
    db.commit()
    return {"message": "Fiyat güncellendi"}