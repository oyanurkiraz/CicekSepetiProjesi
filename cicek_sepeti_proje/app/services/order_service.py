from sqlalchemy.orm import Session
from typing import List, Optional
import random
import string
from .. import models, schemas
from ..decorators import log_execution


class OrderService:
    """
    Sipariş işlemleri için service sınıfı.
    
    Bu sınıf sipariş oluşturma, listeleme ve güncelleme işlemlerini yönetir.
    @log_execution wrapper decorator ile tüm işlemler otomatik olarak loglanır.
    """
    
    @staticmethod
    def generate_tracking_code() -> str:
        """Takip numarası oluşturma"""
        return "ORD-" + "".join(random.choices(string.digits, k=6))
    
    @staticmethod
    @log_execution
    def create_order(
        db: Session,
        order: schemas.OrderCreate,
        customer_id: int
    ) -> Optional[models.Order]:
        """
        Yeni sipariş oluşturma.
        
        Not: @log_execution wrapper ile sipariş oluşturma süresi
        ve durumu otomatik olarak loglanır.
        """
        # Ürün kontrolü
        product = db.query(models.Product).filter(models.Product.id == order.product_id).first()
        if not product:
            return None
        
        # Adres çevirici
        final_address = order.address if order.address else order.receiver_address
        if not final_address:
            final_address = "Adres Girilmedi"
        
        new_order = models.Order(
            customer_id=customer_id,
            product_id=order.product_id,
            tracking_number=OrderService.generate_tracking_code(),
            status="Sipariş Alındı",
            receiver_name=order.receiver_name,
            receiver_phone=order.receiver_phone,
            receiver_address=final_address,
            card_note=order.card_note,
            delivery_date=order.delivery_date
        )
        
        db.add(new_order)
        db.commit()
        db.refresh(new_order)
        return new_order
    
    @staticmethod
    @log_execution
    def get_user_orders(db: Session, user_id: int) -> List[models.Order]:
        """
        Kullanıcının siparişlerini getirme.
        
        Not: @log_execution wrapper ile sorgu süresi loglanır.
        """
        return db.query(models.Order).filter(
            models.Order.customer_id == user_id
        ).order_by(models.Order.id.desc()).all()
    
    @staticmethod
    def get_order_by_tracking(db: Session, tracking_number: str) -> Optional[models.Order]:
        """Takip numarasıyla sipariş bulma"""
        return db.query(models.Order).filter(
            models.Order.tracking_number == tracking_number
        ).first()
    
    @staticmethod
    @log_execution
    def update_order_status(
        db: Session,
        order_id: int,
        seller_id: int,
        new_status: str
    ) -> Optional[models.Order]:
        """
        Sipariş durumu güncelleme (satıcı için).
        
        Not: @log_execution wrapper ile güncelleme işlemi loglanır.
        """
        order = db.query(models.Order).join(models.Product).filter(
            models.Order.id == order_id,
            models.Product.seller_id == seller_id
        ).first()
        
        if not order:
            return None
        
        order.status = new_status
        db.commit()
        return order

