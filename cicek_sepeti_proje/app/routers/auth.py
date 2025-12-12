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
    
    user.role = "corporate" if user_type == "corporate" else "individual"
    return crud.create_user(db=db, user=user)

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    # 1. Kullanıcıyı bul
    user = crud.get_user_by_email(db, email=form_data.username)
    if not user:
        raise HTTPException(status_code=400, detail="Email veya şifre hatalı")
    
    # 2. Şifreyi Kontrol Et (Verify)
    # Burada try-except kullanmıyoruz, çünkü veritabanında düzgün hash olmalı.
    # Eğer veritabanındaki şifre bozuksa (düz metinse) burada hata verebilir,
    # BU YÜZDEN YENİ ÜYE OLMAN GEREKECEK (Aşağıda açıkladım).
    try:
        if not crud.verify_password(form_data.password, user.hashed_password):
            raise HTTPException(status_code=400, detail="Email veya şifre hatalı")
    except Exception:
        # Eğer eski veri bozuksa (hash değilse) giriş yapılamaz
        raise HTTPException(status_code=500, detail="Kullanıcı verisi bozuk, lütfen yeni üyelik açın.")
    
    # 3. Token Oluştur
    access_token_expires = timedelta(minutes=oauth2.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = oauth2.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}