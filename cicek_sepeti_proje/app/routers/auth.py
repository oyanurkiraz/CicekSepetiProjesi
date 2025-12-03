from fastapi import APIRouter, Depends, HTTPException, status
# 👇 BU IMPORT ÇOK ÖNEMLİ (Form verisini işlemek için)
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
from .. import schemas, database, crud, models

router = APIRouter(tags=["Authentication"])

# --- GÜVENLİK AYARLARI ---
SECRET_KEY = "cok_gizli_anahtar_buraya_yazilacak"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Swagger'ın token'ı nereden alacağını bilmesi için:
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

get_db = database.get_db

# --- LOGIN (GÜNCELLENEN KISIM) ---
# Artık JSON yerine Form Data (OAuth2PasswordRequestForm) bekliyoruz
@router.post("/login", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # DİKKAT: OAuth2 formunda email alanı 'username' değişkeninde tutulur.
    # Yani form_data.username aslında bizim emailimizdir.
    user = crud.get_user_by_email(db, email=form_data.username)
    
    if not user or not crud.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Hatalı email veya şifre",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.email, "role": user.role, "user_id": user.id})
    return {"access_token": access_token, "token_type": "bearer"}

# --- TOKEN KONTROLÜ (Aynı kalıyor) ---
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Kimlik doğrulanamadı",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = crud.get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    return user

# --- KAYIT İŞLEMLERİ (Aynı kalıyor) ---
@router.post("/register/individual", response_model=schemas.UserOut)
def register_individual(user: schemas.UserCreateIndividual, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Bu email zaten kayıtlı.")
    return crud.create_user(db=db, user=user)

@router.post("/register/corporate", response_model=schemas.UserOut)
def register_corporate(user: schemas.UserCreateCorporate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Bu email zaten kayıtlı.")
    return crud.create_corporate_user(db=db, user=user)