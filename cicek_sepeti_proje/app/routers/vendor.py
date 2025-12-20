from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database, oauth2
from ..services.vendor_service import VendorService
from ..services.product_service import ProductService
from ..services.order_service import OrderService
from ..decorators import require_vendor

router = APIRouter(prefix="/vendor", tags=["Vendor"])


# ============================================
# VENDOR DEPENDENCY WRAPPER
# ============================================

def get_current_vendor(
    current_user: models.User = Depends(oauth2.get_current_user)
) -> models.User:
    """
    Mevcut kullanıcının satıcı olduğunu doğrulayan dependency wrapper.
    
    Bu fonksiyon, oauth2.get_current_user ve require_vendor decorator'ünü
    birleştirerek tek bir dependency olarak kullanılmasını sağlar.
    
    Kullanım:
        @router.get("/vendor-endpoint")
        def endpoint(current_user: models.User = Depends(get_current_vendor)):
            ...
    """
    return require_vendor(current_user)


# ============================================
# VENDOR ENDPOINTS
# ============================================

@router.get("/products", response_model=List[schemas.ProductOut])
def get_my_products(
    db: Session = Depends(database.get_db), 
    current_user: models.User = Depends(get_current_vendor)
):
    """
    Çiçekçinin ürünleri.
    
    Not: get_current_vendor dependency'si üzerinden require_vendor 
    decorator kontrolü otomatik olarak yapılır.
    """
    return VendorService.get_vendor_products(db=db, vendor_id=current_user.id)


@router.get("/orders", response_model=List[schemas.OrderOut])
def get_incoming_orders(
    db: Session = Depends(database.get_db), 
    current_user: models.User = Depends(get_current_vendor)
):
    """
    Gelen siparişler.
    
    Not: get_current_vendor dependency'si üzerinden require_vendor 
    decorator kontrolü otomatik olarak yapılır.
    """
    return VendorService.get_vendor_orders(db=db, vendor_id=current_user.id)


@router.put("/orders/{id}/status")
def update_order_status(
    id: int, 
    status_text: str, 
    db: Session = Depends(database.get_db), 
    current_user: models.User = Depends(get_current_vendor)
):
    """
    Sipariş durumu güncelle.
    
    Not: get_current_vendor dependency'si üzerinden require_vendor 
    decorator kontrolü otomatik olarak yapılır.
    """
    order = OrderService.update_order_status(
        db=db, order_id=id, seller_id=current_user.id, new_status=status_text
    )
    if not order:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı")
    return {"message": "Durum güncellendi", "status": status_text}


@router.delete("/products/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    id: int, 
    db: Session = Depends(database.get_db), 
    current_user: models.User = Depends(get_current_vendor)
):
    """
    Ürün sil.
    
    Not: get_current_vendor dependency'si üzerinden require_vendor 
    decorator kontrolü otomatik olarak yapılır.
    """
    success = ProductService.delete_product(db=db, product_id=id, seller_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")
    return


@router.put("/products/{id}/price")
def update_product_price(
    id: int, 
    price: float, 
    db: Session = Depends(database.get_db), 
    current_user: models.User = Depends(get_current_vendor)
):
    """
    Ürün fiyatı güncelle.
    
    Not: get_current_vendor dependency'si üzerinden require_vendor 
    decorator kontrolü otomatik olarak yapılır.
    """
    product = ProductService.update_product_price(
        db=db, product_id=id, seller_id=current_user.id, new_price=price
    )
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")
    return {"message": "Fiyat güncellendi"}