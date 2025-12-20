from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import timedelta
from typing import Optional
from .. import models, schemas
from ..oauth2 import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserService:
    """Kullanıcı işlemleri için service sınıfı"""
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Şifre doğrulama"""
        if plain_password == hashed_password:
            return True
        try:
            return pwd_context.verify(plain_password, hashed_password)
        except:
            return False
    
    @staticmethod
    def get_password_hash(password: str) -> str:
        """Şifre hashleme"""
        return pwd_context.hash(password)
    
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
        """Email ile kullanıcı bulma"""
        return db.query(models.User).filter(models.User.email == email).first()
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[models.User]:
        """ID ile kullanıcı bulma"""
        return db.query(models.User).filter(models.User.id == user_id).first()
    
    @staticmethod
    def create_user(db: Session, user: schemas.UserCreate) -> models.User:
        """Yeni kullanıcı oluşturma"""
        hashed_pwd = UserService.get_password_hash(user.password)
        
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
            city=user.city,
            district=user.district
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[models.User]:
        """Kullanıcı girişi doğrulama"""
        user = UserService.get_user_by_email(db, email)
        if not user:
            return None
        if not UserService.verify_password(password, user.hashed_password):
            return None
        return user
    
    @staticmethod
    def create_access_token_for_user(user: models.User) -> str:
        """Kullanıcı için access token oluşturma"""
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"user_id": user.id, "role": user.role},
            expires_delta=access_token_expires
        )
        return access_token
