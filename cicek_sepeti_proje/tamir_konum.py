import sys
import os
sys.path.append(os.getcwd())

from app.database import engine
from sqlalchemy import text

# Hangi e-postanın hangi şehirde olduğunu tanımlıyoruz
updates = [
    {"email": "kadikoy@cicek.com", "city": "İstanbul", "district": "Kadıköy"},
    {"email": "besiktas@cicek.com", "city": "İstanbul", "district": "Beşiktaş"},
    {"email": "sisli@cicek.com", "city": "İstanbul", "district": "Şişli"},
    {"email": "uskudar@cicek.com", "city": "İstanbul", "district": "Üsküdar"},
    {"email": "cankaya@cicek.com", "city": "Ankara", "district": "Çankaya"},
    {"email": "kecioren@cicek.com", "city": "Ankara", "district": "Keçiören"},
    {"email": "konak@cicek.com", "city": "İzmir", "district": "Konak"},
    {"email": "karsiyaka@cicek.com", "city": "İzmir", "district": "Karşıyaka"},
    {"email": "muratpasa@cicek.com", "city": "Antalya", "district": "Muratpaşa"},
    {"email": "nilufer@cicek.com", "city": "Bursa", "district": "Nilüfer"},
]

def fix_locations():
    print("🔧 Konumlar tamir ediliyor...")
    
    with engine.connect() as conn:
        trans = conn.begin()
        try:
            count = 0
            for item in updates:
                # SQL UPDATE komutu ile verileri zorla yazıyoruz
                query = text("""
                    UPDATE users 
                    SET city = :city, district = :district 
                    WHERE email = :email
                """)
                result = conn.execute(query, item)
                count += result.rowcount
            
            trans.commit()
            print(f"✅ İşlem Tamam! Toplam {count} satıcının konumu güncellendi.")
            
        except Exception as e:
            trans.rollback()
            print(f"❌ Hata: {e}")

if __name__ == "__main__":
    fix_locations()