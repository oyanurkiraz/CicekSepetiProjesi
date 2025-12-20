from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from .. import database, schemas, models, oauth2
from ..services.user_service import UserService

router = APIRouter(tags=["Authentication"])


@router.post("/register/{user_type}", response_model=schemas.UserOut)
def register(user_type: str, user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    """Yeni kullanıcı kaydı"""
    # Email kontrolü
    db_user = UserService.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Bu email zaten kayıtlı")
    
    # Kullanıcı rolünü ayarla
    user.role = "corporate" if user_type == "corporate" else "individual"
    return UserService.create_user(db=db, user=user)


@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    """Kullanıcı girişi"""
    # Kullanıcı doğrulama
    user = UserService.authenticate_user(db, email=form_data.username, password=form_data.password)
    
    if not user:
        raise HTTPException(status_code=400, detail="Email veya şifre hatalı")
    
    # Token oluştur
    access_token = UserService.create_access_token_for_user(user)
    return {"access_token": access_token, "token_type": "bearer"}


@router.get('/auth/me', response_model=schemas.UserOut)
def get_user_info(current_user: models.User = Depends(oauth2.get_current_user)):
    """Giriş yapmış kullanıcının bilgilerini döndürür"""
    return current_user