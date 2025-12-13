from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# --- KULLANICI ---
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    name: str 
    phone_number: Optional[str] = None
    role: str = "individual"
    company_name: Optional[str] = None
    
    # Kural: users tablosunda address
    address: Optional[str] = None 
    
    city: Optional[str] = None
    district: Optional[str] = None

class UserOut(UserBase):
    id: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    
    # Kural: users tablosunda address
    address: Optional[str] = None 
    
    city: Optional[str] = None
    district: Optional[str] = None
    role: str
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# --- ÜRÜN ---
class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    image_url: str
    is_active: bool = True
    category: Optional[str] = None 

class ProductCreate(ProductBase):
    pass

class ProductOut(ProductBase):
    id: int
    seller_id: Optional[int] = None
    seller: Optional[UserOut] = None 
    class Config:
        from_attributes = True

# --- FAVORİ ---
class FavoriteBase(BaseModel):
    product_id: int

class FavoriteOut(BaseModel):
    id: int
    product: ProductOut
    class Config:
        from_attributes = True

# --- SİPARİŞ (ORDER) ---
class OrderCreate(BaseModel):
    product_id: int
    receiver_name: str
    
    # 👇 SADECE receiver_address kaldı (Frontend'den address veya receiver_address gelebilir)
    address: Optional[str] = None 
    receiver_address: Optional[str] = None 
    
    receiver_phone: Optional[str] = None
    card_note: Optional[str] = None
    delivery_date: Optional[str] = None
    
    class Config:
        extra = "ignore" 

class OrderOut(BaseModel):
    id: int
    product_id: int
    product: ProductOut
    status: str
    receiver_name: str
    
    # Kural: orders tablosundan receiver_address (Çift 'd') olarak okuyoruz
    receiver_address: Optional[str] = None 
    receiver_phone: Optional[str] = None
    
    card_note: Optional[str] = None
    tracking_number: str
    
    order_date: Optional[datetime] = None 
    
    class Config:
        from_attributes = True 

# --- YORUM ---
class ReviewCreate(BaseModel):
    product_id: int
    rating: int
    comment: str

class ReviewOut(BaseModel):
    id: int
    rating: int
    comment: str
    created_at: Optional[datetime] = None
    user: Optional[UserOut] = None
    class Config:
        from_attributes = True