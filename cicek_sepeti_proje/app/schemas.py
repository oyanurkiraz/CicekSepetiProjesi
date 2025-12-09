from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional

# --- AUTH SCHEMAS ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None

# --- USER SCHEMAS ---
class UserBase(BaseModel):
    email: str
    phone: str

class UserCreateIndividual(UserBase):
    password: str
    first_name: str
    last_name: str

class UserCreateCorporate(UserBase):
    password: str
    first_name: str # Yetkili adı
    last_name: str  # Yetkili soyadı
    company_name: str
    address: str
    city: str
    district: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: str
    city: Optional[str] = None
    
    class Config:
        from_attributes = True

# --- PRODUCT SCHEMAS ---
class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    image_url: str

class ProductCreate(ProductBase):
    pass

class ProductOut(ProductBase):
    id: int
    seller_id: Optional[int] = None
    seller_company_name: Optional[str] = None
    seller_city: Optional[str] = None
    
    class Config:
        from_attributes = True

# --- ORDER SCHEMAS ---
class OrderCreate(BaseModel):
    product_id: int
    delivery_date: str
    delivery_time_slot: str
    receiver_name: str
    receiver_phone: str
    receiver_city: str
    receiver_district: str
    receiver_address: str
    card_note: str

class OrderOut(BaseModel):
    tracking_number: str
    status: str
    product_name: str
    delivery_date: str
    receiver_name: str
    
    class Config:
        from_attributes = True

# --- REVIEW SCHEMAS ---
class ReviewCreate(BaseModel):
    comment: str
    rating: int # 1-5 arası

class ReviewOut(ReviewCreate):
    id: int
    user_id: int
    product_id: int
    created_at: datetime # Tarih formatı
    
    class Config:
        from_attributes = True