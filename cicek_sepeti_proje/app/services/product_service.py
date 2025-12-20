from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas


class ProductService:
    """Ürün işlemleri için service sınıfı"""
    
    @staticmethod
    def get_products(
        db: Session,
        search: str = "",
        category: Optional[str] = None,
        city: Optional[str] = None,
        district: Optional[str] = None
    ) -> List[models.Product]:
        """Ürün listesi getirme (filtreleme destekli)"""
        query = db.query(models.Product).join(models.User).filter(models.Product.is_active == True)
        
        # Kategori filtresi
        if category:
            query = query.filter(models.Product.category == category)
        
        # Şehir ve ilçe filtresi
        if city:
            query = query.filter(models.User.city == city)
        if district:
            query = query.filter(models.User.district == district)
        
        # İsim arama
        if search:
            query = query.filter(models.Product.name.ilike(f"%{search}%"))
        
        return query.all()
    
    @staticmethod
    def get_product_by_id(db: Session, product_id: int) -> Optional[models.Product]:
        """Tek ürün getirme"""
        return db.query(models.Product).filter(models.Product.id == product_id).first()
    
    @staticmethod
    def create_product(db: Session, product: schemas.ProductCreate, seller_id: int) -> models.Product:
        """Yeni ürün oluşturma"""
        new_product = models.Product(**product.dict(), seller_id=seller_id)
        db.add(new_product)
        db.commit()
        db.refresh(new_product)
        return new_product
    
    @staticmethod
    def update_product_price(db: Session, product_id: int, seller_id: int, new_price: float) -> Optional[models.Product]:
        """Ürün fiyatı güncelleme"""
        product = db.query(models.Product).filter(models.Product.id == product_id).first()
        if not product or product.seller_id != seller_id:
            return None
        product.price = new_price
        db.commit()
        return product
    
    @staticmethod
    def delete_product(db: Session, product_id: int, seller_id: int) -> bool:
        """Ürün silme"""
        product = db.query(models.Product).filter(models.Product.id == product_id).first()
        if not product or product.seller_id != seller_id:
            return False
        db.delete(product)
        db.commit()
        return True
