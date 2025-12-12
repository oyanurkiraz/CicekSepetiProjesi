from sqlalchemy import Column, Integer, String, ForeignKey, Float, DateTime, Boolean
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    first_name = Column(String)
    last_name = Column(String)
    phone = Column(String, nullable=True)
    role = Column(String, default="individual")
    company_name = Column(String, nullable=True)
    address = Column(String, nullable=True)
    
    # 👇 SATICI KONUMU İÇİN ÖNEMLİ
    city = Column(String, nullable=True)     
    district = Column(String, nullable=True) 

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, index=True)
    description = Column(String)
    price = Column(Float)
    image_url = Column(String)
    is_active = Column(Boolean, default=True)
    
    # 👇 YENİ: KATEGORİ (Doğum Günü, Yılbaşı vb.)
    category = Column(String, index=True, nullable=True) 
    
    # İlişki (Satıcının şehrine ulaşmak için lazım)
    seller = relationship("User")

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    tracking_number = Column(String, unique=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    status = Column(String, default="Sipariş Alındı")
    order_date = Column(DateTime, default=datetime.utcnow)
    delivery_date = Column(String)
    delivery_time_slot = Column(String, nullable=True)
    receiver_name = Column(String)
    receiver_phone = Column(String)
    receiver_address = Column(String)
    receiver_city = Column(String, nullable=True)
    receiver_district = Column(String, nullable=True)
    card_note = Column(String, nullable=True)
    product = relationship("Product")

class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    comment = Column(String)
    rating = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User")

# 👇 YENİ: FAVORİLER TABLOSU
class Favorite(Base):
    __tablename__ = "favorites"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    
    product = relationship("Product")