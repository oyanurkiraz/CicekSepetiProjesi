from sqlalchemy.orm import Session, joinedload
from typing import List
from .. import models


class VendorService:
    """Çiçekçi (Kurumsal Satıcı) işlemleri için service sınıfı"""
    
    @staticmethod
    def is_vendor(user: models.User) -> bool:
        """Kullanıcının satıcı olup olmadığını kontrol et"""
        return user.role == "corporate"
    
    @staticmethod
    def get_vendor_products(db: Session, vendor_id: int) -> List[models.Product]:
        """Satıcının ürünlerini getirme"""
        return db.query(models.Product).filter(
            models.Product.seller_id == vendor_id
        ).all()
    
    @staticmethod
    def get_vendor_orders(db: Session, vendor_id: int) -> List[models.Order]:
        """Satıcıya gelen siparişleri getirme"""
        return db.query(models.Order)\
            .options(joinedload(models.Order.product))\
            .join(models.Product, models.Order.product_id == models.Product.id)\
            .filter(models.Product.seller_id == vendor_id)\
            .order_by(models.Order.id.desc())\
            .all()
