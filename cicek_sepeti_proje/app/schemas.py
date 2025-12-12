from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# USER
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    name: str 
    phone_number: Optional[str] = None
    role: str = "individual"
    company_name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None      # Şehir Seçimi İçin
    district: Optional[str] = None  # İlçe Seçimi İçin

class UserOut(UserBase):
    id: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    role: str
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# PRODUCT
class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    image_url: str
    is_active: bool = True
    category: Optional[str] = None # Kategori Eklendi

class ProductCreate(ProductBase):
    pass

class ProductOut(ProductBase):
    id: int
    seller_id: Optional[int] = None
    seller: Optional[UserOut] = None # Satıcı bilgisi (Şehri görmek için)
    class Config:
        from_attributes = True

# FAVORITE
class FavoriteBase(BaseModel):
    product_id: int

class FavoriteOut(BaseModel):
    id: int
    product: ProductOut
    class Config:
        from_attributes = True

# ORDER & REVIEW (Aynı kalabilir, yer kaplamasın diye kısalttım ama tam halini koru)
class OrderCreate(BaseModel):
    product_id: int
    receiver_name: str
    receiver_phone: Optional[str] = None
    receiver_address: str
    card_note: Optional[str] = None
    delivery_date: Optional[str] = "Hemen Teslim"
    delivery_time_slot: Optional[str] = None
    receiver_city: Optional[str] = None
    receiver_district: Optional[str] = None

class OrderOut(OrderCreate):
    id: int
    tracking_number: str
    status: str
    order_date: Optional[datetime] = None
    product: Optional[ProductOut] = None
    class Config:
        from_attributes = True

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