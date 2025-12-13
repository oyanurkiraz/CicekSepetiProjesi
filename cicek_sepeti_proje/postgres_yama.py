import sqlalchemy
from sqlalchemy import create_engine, text

# 👇 BURAYA KENDİ DATABASE URL'Nİ YAZ (app/database.py içinden bakabilirsin)
# Örnek: "postgresql://postgres:sifren@localhost/ciceksepeti"
DATABASE_URL = "postgresql://postgres:1@localhost/ciceksepeti_app"

def fix_postgres_db():
    print(f"🔧 PostgreSQL Veritabanı Güncelleniyor...")
    
    try:
        engine = create_engine(DATABASE_URL)
        
        # 'autocommit' modu için connection açıyoruz
        with engine.connect() as conn:
            conn.execution_options(isolation_level="AUTOCOMMIT")
            
            # 1. Orders tablosuna eksik sütunları ekle
            try:
                conn.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS address VARCHAR"))
                print("✅ 'address' sütunu eklendi.")
            except Exception as e:
                print(f"ℹ️ Address hatası (önemsiz olabilir): {e}")

            try:
                conn.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS receiver_phone VARCHAR"))
                print("✅ 'receiver_phone' sütunu eklendi.")
            except Exception as e:
                print(f"ℹ️ Receiver Phone hatası (önemsiz olabilir): {e}")

            # 2. Users tablosuna şehir/ilçe ekle
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR"))
                print("✅ 'city' sütunu eklendi.")
            except Exception as e:
                print(f"ℹ️ City hatası (önemsiz olabilir): {e}")

            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS district VARCHAR"))
                print("✅ 'district' sütunu eklendi.")
            except Exception as e:
                print(f"ℹ️ District hatası (önemsiz olabilir): {e}")

            conn.commit()
            
        print("\n🚀 İŞLEM TAMAM! Verilerin silinmedi, sütunlar eklendi.")
        
    except Exception as e:
        print(f"\n❌ BAĞLANTI HATASI: {e}")
        print("Lütfen 'DATABASE_URL' değişkenini doğru yazdığından emin ol.")

if __name__ == "__main__":
    fix_postgres_db()