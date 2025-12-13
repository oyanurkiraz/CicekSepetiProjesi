from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from .. import database, schemas, models, crud, oauth2

router = APIRouter(tags=["Authentication"])

@router.post("/register/{user_type}", response_model=schemas.UserOut)
def register(user_type: str, user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Bu email zaten kayıtlı")
    
    # Kullanıcı rolünü ayarla
    user.role = "corporate" if user_type == "corporate" else "individual"
    return crud.create_user(db=db, user=user)

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    
    # 1. Kullanıcıyı bul
    user = crud.get_user_by_email(db, email=form_data.username)
    if not user:
        raise HTTPException(status_code=400, detail="Email veya şifre hatalı")
    
    # 2. Şifreyi Kontrol Et (Verify)
    try:
        # Not: crud.verify_password kullanılıyor. Eğer şifre hashlenmemişse hata verecektir.
        if not crud.verify_password(form_data.password, user.hashed_password):
            raise HTTPException(status_code=400, detail="Email veya şifre hatalı")
    except Exception:
        raise HTTPException(status_code=500, detail="Kullanıcı verisi bozuk, lütfen yeni üyelik açın.")
    
    # 3. Token Oluştur (Rol bilgisini de ekliyoruz!)
    access_token_expires = timedelta(minutes=oauth2.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # 👇 BURASI ÇOK ÖNEMLİ: Token içine user_id ve rolü ekliyoruz.
    access_token = oauth2.create_access_token(
        data={"user_id": user.id, "role": user.role}, 
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


# 👇 EKSİK OLAN ENDPOINT: Kullanıcının kendi bilgilerini (rolünü) çekme
@router.get('/auth/me', response_model=schemas.UserOut)
def get_user_info(current_user: models.User = Depends(oauth2.get_current_user)):
    """
    Token'ı gönderen kullanıcının tüm User model bilgilerini döndürür.
    Bu, Frontend'in kullanıcının rolünü (corporate/individual) öğrenmesini sağlar.
    """
    return current_user