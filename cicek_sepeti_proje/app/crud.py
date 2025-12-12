from sqlalchemy.orm import Session
from passlib.context import CryptContext
from . import models, schemas

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    if plain_password == hashed_password:
        return True
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except:
        return False

def get_password_hash(password):
    return pwd_context.hash(password)

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_pwd = get_password_hash(user.password)
    
    parts = user.name.strip().split(" ")
    last_n = parts.pop() if len(parts) > 1 else ""
    first_n = " ".join(parts) if parts else user.name

    db_user = models.User(
        email=user.email,
        hashed_password=hashed_pwd,
        first_name=first_n,
        last_name=last_n,
        phone=user.phone_number,
        role=user.role,
        company_name=user.company_name,
        address=user.address,
        
        # 👇 İŞTE EKSİK OLAN SATIRLAR BUNLARDI:
        city=user.city,         # Şehri kaydet
        district=user.district  # İlçeyi kaydet
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user