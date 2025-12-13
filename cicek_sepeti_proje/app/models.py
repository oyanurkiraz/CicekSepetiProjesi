from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    role = Column(String, default="individual") 
    
    company_name = Column(String, nullable=True)
    
    # Kural 1: users tablosunda address
    address = Column(String, nullable=True) 
    
    city = Column(String, nullable=True)     
    district = Column(String, nullable=True) 

    # İlişkiler
    orders = relationship("Order", back_populates="customer")
    products = relationship("Product", back_populates="seller")
    reviews = relationship("Review", back_populates="user")
    favorites = relationship("Favorite", back_populates="user")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    price = Column(Float)
    image_url = Column(String)
    category = Column(String, index=True, nullable=True)
    is_active = Column(Boolean, default=True)
    
    seller_id = Column(Integer, ForeignKey("users.id"))
    seller = relationship("User", back_populates="products")
    
    reviews = relationship("Review", back_populates="product")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    tracking_number = Column(String, unique=True, index=True)
    status = Column(String, default="Sipariş Alındı")
    
    # Senin veritabanı şemana göre
    customer_id = Column(Integer, ForeignKey("users.id")) 
    product_id = Column(Integer, ForeignKey("products.id"))
    
    receiver_name = Column(String)
    receiver_phone = Column(String, nullable=True)
    
    # 👇 Kural 2: SADECE receiver_address kaldı. Gereksiz address satırı silindi.
    receiver_address = Column(String, nullable=True) 
    
    receiver_city = Column(String, nullable=True)
    receiver_district = Column(String, nullable=True)
    delivery_time_slot = Column(String, nullable=True)
    
    card_note = Column(String, nullable=True)
    delivery_date = Column(String, nullable=True)

    order_date = Column(DateTime(timezone=True), server_default=func.now())

    # İlişkiler
    customer = relationship("User", back_populates="orders")
    product = relationship("Product")

class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    comment = Column(String)
    rating = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="reviews")
    product = relationship("Product", back_populates="reviews")

class Favorite(Base):
    __tablename__ = "favorites"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    
    user = relationship("User", back_populates="favorites")
    product = relationship("Product")