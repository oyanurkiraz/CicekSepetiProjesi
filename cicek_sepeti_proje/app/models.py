from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    role = Column(String, default="individual") # "individual" (Müşteri) veya "corporate" (Çiçekçi)
    
    # Bireysel Bilgiler
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    
    # Kurumsal Bilgiler (Sadece çiçekçilerde dolu olacak)
    company_name = Column(String, nullable=True)
    address = Column(String, nullable=True) # Çiçekçinin adresi (Hangi ilden gönderim yapacak)
    city = Column(String, nullable=True)    # Örn: İstanbul
    district = Column(String, nullable=True)# Örn: Kadıköy

    # İlişkiler
    products = relationship("Product", back_populates="seller")
    orders = relationship("Order", back_populates="customer")
    reviews = relationship("Review", back_populates="author")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(Integer, ForeignKey("users.id")) # Hangi çiçekçi satıyor?
    name = Column(String, index=True)
    description = Column(Text)
    price = Column(Float)
    image_url = Column(String)
    is_active = Column(Boolean, default=True)
    
    seller = relationship("User", back_populates="products")
    reviews = relationship("Review", back_populates="product")
    
    # 👇 YENİ EKLENEN: Order tablosu ile çift yönlü ilişki
    orders = relationship("Order", back_populates="product")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    tracking_number = Column(String, unique=True, index=True) # Sipariş No
    customer_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id")) # Basitlik için tek ürünlü sipariş
    
    status = Column(String, default="Sipariş Alındı") # Hazırlanıyor, Yola Çıktı, Teslim Edildi
    order_date = Column(DateTime(timezone=True), server_default=func.now())
    
    # Teslimat Seçenekleri
    delivery_date = Column(String) # Müşterinin seçtiği tarih
    delivery_time_slot = Column(String) # Müşterinin seçtiği saat aralığı

    # Alıcı Bilgileri
    receiver_name = Column(String)
    receiver_phone = Column(String)
    receiver_city = Column(String)
    receiver_district = Column(String)
    receiver_address = Column(String)
    card_note = Column(Text) # Çiçek notu

    customer = relationship("User", back_populates="orders")
    
    # 👇 YENİ EKLENEN: Product tablosuna erişim
    product = relationship("Product", back_populates="orders")

    # 👇 YENİ EKLENEN: Hatayı çözen sihirli kısım.
    # Sipariş verisi çekilirken "product_name" istendiğinde burası çalışır.
    @property
    def product_name(self):
        return self.product.name if self.product else "Bilinmeyen Ürün"
    
class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    comment = Column(Text)
    rating = Column(Integer) # 1-5 arası puan
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    product = relationship("Product", back_populates="reviews")
    author = relationship("User", back_populates="reviews")