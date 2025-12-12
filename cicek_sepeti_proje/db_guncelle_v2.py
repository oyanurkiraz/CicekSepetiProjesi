import sys
import os
sys.path.append(os.getcwd())
from app.database import engine
from sqlalchemy import text

def update_db():
    print("⏳ Veritabanı V2 Güncellemesi Başlıyor...")
    with engine.connect() as conn:
        conn.execute(text("COMMIT;")) # Transaction kilidini aç
        try:
            # 1. Users Tablosuna Şehir/İlçe Ekle
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR;"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS district VARCHAR;"))
            
            # 2. Products Tablosuna Kategori Ekle
            conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR;"))
            
            # 3. Favorites Tablosunu Oluştur (SQL ile)
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS favorites (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id),
                    product_id INTEGER REFERENCES products(id)
                );
            """))
            
            print("✅ Veritabanı başarıyla güncellendi!")
        except Exception as e:
            print(f"❌ Hata: {e}")

if __name__ == "__main__":
    update_db()