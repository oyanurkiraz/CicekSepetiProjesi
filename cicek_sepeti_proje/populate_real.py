import requests
import random
import sys

# 1. BAĞLANTI TESTİ
print("⏳ Script başlatılıyor...")
BASE_URL = "http://127.0.0.1:8000"

try:
    test = requests.get(f"{BASE_URL}/docs")
    if test.status_code == 200:
        print("✅ Backend bağlantısı başarılı!")
    else:
        print(f"⚠️ Backend cevap veriyor ama durum kodu: {test.status_code}")
except Exception as e:
    print(f"❌ Backend'e bağlanılamadı! Lütfen 'uvicorn'un çalıştığından emin ol.\nHata: {e}")
    sys.exit()

# 2. VERİLER
sellers = [
    {"email": "kadikoy@cicek.com", "pass": "123456", "name": "Kadıköy Çiçekçilik", "city": "İstanbul", "district": "Kadıköy"},
    {"email": "besiktas@cicek.com", "pass": "123456", "name": "Beşiktaş Flora", "city": "İstanbul", "district": "Beşiktaş"},
    {"email": "cankaya@cicek.com", "pass": "123456", "name": "Çankaya Serası", "city": "Ankara", "district": "Çankaya"},
    {"email": "konak@cicek.com", "pass": "123456", "name": "Konak Çiçekçisi", "city": "İzmir", "district": "Konak"},
    {"email": "nilufer@cicek.com", "pass": "123456", "name": "Bursa Nilüfer Çiçek", "city": "Bursa", "district": "Nilüfer"},
]

products_data = {
    "Yılbaşı": [
        {"name": "Şans Getiren Kokina", "img": "https://images.unsplash.com/photo-1543255006-d6395b6f1171?w=800"},
        {"name": "Yılbaşı Işıltısı Aranjman", "img": "https://images.unsplash.com/photo-1512474932049-78ac69ede12c?w=800"},
    ],
    "Doğum Günü": [
        {"name": "Renkli Düşler Papatyalar", "img": "https://images.unsplash.com/photo-1563241527-3004b7be025a?w=800"},
        {"name": "Mutlu Yıllar Lale Buketi", "img": "https://images.unsplash.com/photo-1520763185298-1b434c919102?w=800"},
    ],
    "Aşk Tutku": [
        {"name": "101 Kırmızı Gül", "img": "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=800"},
        {"name": "Seni Seviyorum Buketi", "img": "https://images.unsplash.com/photo-1589244159943-460088ed5c92?w=800"}
    ]
}

def run_script():
    print("🚀 ŞEHİRLİ VERİTABANI DOLDURMA BAŞLADI...")
    
    for seller in sellers:
        print(f"\n👤 İşleniyor: {seller['name']}...")
        
        # ÜYELİK / GİRİŞ
        token = ""
        reg_payload = {
            "email": seller["email"], "password": seller["pass"], "name": seller["name"],
            "role": "corporate", "city": seller["city"], "district": seller["district"],
            "company_name": seller["name"], "address": "Merkez", "phone_number": "555"
        }
        
        # Kayıt Ol
        try:
            requests.post(f"{BASE_URL}/register/corporate", json=reg_payload)
        except:
            pass # Zaten varsa geç

        # Giriş Yap
        login_data = {"username": seller["email"], "password": seller["pass"]}
        r_login = requests.post(f"{BASE_URL}/login", data=login_data)
        
        if r_login.status_code == 200:
            token = r_login.json()["access_token"]
        else:
            print(f"   ❌ Giriş Başarısız: {seller['email']}")
            continue

        # ÜRÜN EKLE
        headers = {"Authorization": f"Bearer {token}"}
        count = 0
        for category, items in products_data.items():
            for item in items:
                payload = {
                    "name": item["name"], "description": "Taze Çiçek", "price": random.randint(300, 900),
                    "image_url": item["img"], "category": category, "is_active": True
                }
                r = requests.post(f"{BASE_URL}/products/", json=payload, headers=headers)
                if r.status_code == 201: count += 1
        
        print(f"   ✅ {count} adet çiçek eklendi.")

    print("\n🏁 BİTTİ! Siteye girip kontrol et.")

if __name__ == "__main__":
    run_script()