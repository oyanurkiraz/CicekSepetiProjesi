import uuid
from sqlalchemy.orm import Session
from . import models, schemas
from passlib.context import CryptContext

# 👇 DEĞİŞİKLİK BURADA: "bcrypt" yerine "argon2" yaptık.
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

# --- BİREYSEL KULLANICI OLUŞTURMA ---
def create_user(db: Session, user: schemas.UserCreateIndividual):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        phone=user.phone,
        role="individual",
        first_name=user.first_name,
        last_name=user.last_name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- KURUMSAL KULLANICI OLUŞTURMA ---
def create_corporate_user(db: Session, user: schemas.UserCreateCorporate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        phone=user.phone,
        role="corporate",
        first_name=user.first_name,
        last_name=user.last_name,
        company_name=user.company_name,
        address=user.address,
        city=user.city,
        district=user.district
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- ÜRÜN (ÇİÇEK) İŞLEMLERİ ---
def create_product(db: Session, product: schemas.ProductCreate, seller_id: int):
    db_product = models.Product(
        **product.dict(),
        seller_id=seller_id
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

# --- ÜRÜN LİSTELEME (FİLTRELİ) ---
def get_products(db: Session, skip: int = 0, limit: int = 100, city: str = None, district: str = None):
    # Temel sorgu: Ürünleri ve Satıcılarını birleştir (join)
    query = db.query(models.Product).join(models.User)
    
    # Eğer şehir filtresi varsa ekle
    if city:
        query = query.filter(models.User.city == city)
    
    # Eğer ilçe filtresi varsa ekle
    if district:
        query = query.filter(models.User.district == district)
        
    return query.offset(skip).limit(limit).all()

# --- SİPARİŞ İŞLEMLERİ ---

def create_order(db: Session, order: schemas.OrderCreate, user_id: int):
    # Rastgele 8 haneli bir takip kodu oluştur (Örn: A1B2C3D4)
    tracking_code = str(uuid.uuid4()).split("-")[0].upper()
    
    db_order = models.Order(
        **order.dict(),
        customer_id=user_id,      # Token'dan gelen müşteri ID
        tracking_number=tracking_code,
        status="Sipariş Alındı"
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

def get_my_orders(db: Session, user_id: int):
    # Sadece o kullanıcının siparişlerini getir
    return db.query(models.Order).filter(models.Order.customer_id == user_id).all()
# --- SİPARİŞ TAKİBİ (Tracking) ---
def get_order_by_tracking(db: Session, tracking_number: str):
    # Sadece takip numarasına göre arama yap
    return db.query(models.Order).filter(models.Order.tracking_number == tracking_number).first()
# --- SATICI (ÇİÇEKÇİ) PANELİ İŞLEMLERİ ---

def get_orders_for_seller(db: Session, seller_id: int):
    # Order tablosunu Product tablosuyla birleştir.
    # Ürünün satıcısı (seller_id) bizim kullanıcımızsa o siparişleri getir.
    return db.query(models.Order).join(models.Product).filter(models.Product.seller_id == seller_id).all()

def update_order_status(db: Session, order_id: int, new_status: str):
    # Siparişi bul
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if order:
        # Durumu güncelle
        order.status = new_status
        db.commit()
        db.refresh(order)
    return order

# --- YORUM (REVIEW) İŞLEMLERİ ---

def create_review(db: Session, review: schemas.ReviewCreate, user_id: int, product_id: int):
    db_review = models.Review(
        **review.dict(),
        user_id=user_id,
        product_id=product_id
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

def get_reviews_by_product(db: Session, product_id: int):
    # Sadece o ürüne ait yorumları getir
    return db.query(models.Review).filter(models.Review.product_id == product_id).all()