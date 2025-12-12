import requests
import random
import sys

BASE_URL = "http://127.0.0.1:8000"

print("⏳ Veritabanı Genişletme Operasyonu Başlıyor...")

# 1. YENİ ŞEHİRLER VE İLÇELER İÇİN SANAL SATICILAR
# Her ilçeye bir dükkan açıyoruz
new_sellers = [
    # TRABZON
    {"city": "Trabzon", "district": "Ortahisar", "name": "Trabzon Merkez Çiçek"},
    {"city": "Trabzon", "district": "Akçaabat", "name": "Akçaabat Flora"},
    {"city": "Trabzon", "district": "Of", "name": "Of Çiçek Sarayı"},
    # RİZE
    {"city": "Rize", "district": "Merkez", "name": "Rize Çay Çiçek"},
    {"city": "Rize", "district": "Çayeli", "name": "Çayeli Botanik"},
    # SAMSUN
    {"city": "Samsun", "district": "İlkadım", "name": "Samsun Park Çiçek"},
    {"city": "Samsun", "district": "Atakum", "name": "Atakum Garden"},
    # ERZİNCAN
    {"city": "Erzincan", "district": "Merkez", "name": "Erzincan Lalezar"},
    {"city": "Erzincan", "district": "Üzümlü", "name": "Üzümlü Çiçekçilik"},
    # MEVCUTLARA EK (İSTANBUL/ANKARA)
    {"city": "İstanbul", "district": "Maltepe", "name": "Maltepe Çiçek"},
    {"city": "Ankara", "district": "Yenimahalle", "name": "Yenimahalle Serası"},
]

# 2. ÜRÜN HAVUZU (HER KATEGORİDEN 10 TANE)
# Not: Resimler Unsplash'ten rastgele doğa/çiçek temalı
catalog = {
    "Yılbaşı": [
        "Kokina ve Çam Buketi", "Kırmızı Yılbaşı Rüyası", "Işıklı Çam Ağacı", "Yılbaşı Kapı Süsü", 
        "Gold Detaylı Aranjman", "Kozalaklı Kış Buketi", "Yeni Yıl Umut Çiçeği", "Kırmızı Atatürk Çiçeği",
        "Mutlu Yıllar Kutusu", "Kar Tanesi Beyaz Güller"
    ],
    "Doğum Günü": [
        "Renkli Papatya Bahçesi", "Doğum Günü Gülleri", "Mutlu Yaşlar Orkidesi", "Gökkuşağı Lale Buketi",
        "Neşeli Gerbera Aranjmanı", "İyi Ki Doğdun Vazosu", "Prenses Pembe Güller", "Renkli Hüsnüyusuf",
        "Sürpriz Doğum Günü Kutusu", "Balonlu Çiçek Sepeti"
    ],
    "Aşk Tutku": [
        "101 Kırmızı Gül", "Sonsuz Aşk Kutusu", "Kalbim Seninle Aranjmanı", "Tutkulu Kırmızı Laleler",
        "Seni Seviyorum Buketi", "Aşkın Rengi Kırmızı", "Romantik Akşam Gülleri", "Kalp Vazoda Güller",
        "Tek Dal Kırmızı Gül", "Büyülü Aşk Serisi"
    ],
    "Yeni İş": [
        "Başarılar Bonsai Ağacı", "Bereket Bambusu", "Ofis Şıklığı Teraryum", "Tebrikler Orkidesi",
        "Masaüstü Sukulent Bahçesi", "Kariyer Yolu Aranjmanı", "Huzur Veren Devetabanı", "Yeni İş Hediyesi Lilyum",
        "Şans Getiren Para Ağacı", "Ofis Ferahlığı Bitkisi"
    ],
    "Özür Dilerim": [
        "Beni Affet Beyaz Güller", "Masumiyet Lilyumları", "Barış Çiçeği Spathiphyllum", "Telafi Buketi",
        "Üzgünüm Papatyaları", "Beyaz Orkide Zarafeti", "Kırık Kalp Onarıcı", "Samimi Özür Aranjmanı",
        "Saf Duygular Beyaz Lale", "Dostluk Eli Krizantem"
    ],
    # TARZ KATEGORİLERİ (Senin İsteğin)
    "Zarif": [
        "Zarif Beyaz Orkide", "İnci Tanem Aranjmanı", "Sade Güzellik Lilyum", "Minimalist Gül Vazosu",
        "Pastel Tonlar Buketi", "Zarafet Simgesi Lisyantus", "Kuğu Gölü Beyaz Gül", "Soft Dokunuşlar",
        "Doğal Güzellik Kır Çiçeği", "Asil Duruş Antoryum"
    ],
    "Modern": [
        "Modern Beton Saksıda Sukulent", "Geometrik Teraryum", "Siyah Kutuda Güller", "Modern Sanat Aranjmanı",
        "İskandinav Tarzı Bitki", "Minimalist Kuru Çiçekler", "Şehirli Tasarım Buket", "Trend Okaliptus Demeti",
        "Metalik Vazo Serisi", "Soyut Tasarım Çiçek"
    ],
    "Renkli": [
        "Karnaval Çiçek Sepeti", "Bahar Şenliği Buketi", "Gökkuşağı Güller", "Enerji Veren Ayçiçekleri",
        "Turuncu ve Mor Uyumu", "Festival Havası Aranjman", "Canlı Renkler Serisi", "Pozitif Enerji Kutusu",
        "Renkli Kır Bahçesi", "Yaz Neşesi Buketi"
    ],
    "Soft": [
        "Pudra Pembesi Güller", "Soft Renkler Lisyantus", "Pamuk Şeker Buketi", "Huzur Veren Lavantalar",
        "Pastel Rüyası Aranjman", "Bebek Mavisi Ortanca", "Krem Rengi Güller", "Yumuşak Dokunuş Papatya",
        "Romantik Gün Batımı", "Sakinlik Veren Yeşillikler"
    ]
}

def generate_db():
    total_added = 0
    
    for seller in new_sellers:
        print(f"\n📍 Dükkan Açılıyor: {seller['name']} - {seller['district']}/{seller['city']}")
        
        # 1. E-POSTA OLUŞTUR (Türkçe karakterleri temizle)
        safe_name = seller['district'].lower().replace("ç","c").replace("ş","s").replace("ı","i").replace("ö","o").replace("ü","u").replace("ğ","g")
        email = f"{safe_name}@cicek.com"
        password = "123"

        # 2. KAYIT OL / GİRİŞ YAP
        reg_payload = {
            "email": email, "password": password, "name": seller['name'],
            "role": "corporate", "city": seller['city'], "district": seller['district'],
            "company_name": seller['name'], "address": f"{seller['district']} Meydanı No:1",
            "phone_number": "0555 555 55 55"
        }
        
        try:
            requests.post(f"{BASE_URL}/register/corporate", json=reg_payload)
        except: pass # Zaten varsa devam et

        # Giriş yapıp Token al
        r_login = requests.post(f"{BASE_URL}/login", data={"username": email, "password": password})
        if r_login.status_code != 200:
            print("   ❌ Giriş yapılamadı, geçiliyor.")
            continue
            
        token = r_login.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 3. ÜRÜNLERİ YÜKLE
        # Her kategoriden ürünleri ekle
        for category, products in catalog.items():
            for prod_name in products:
                # Fiyatı ve Resmi Rastgele Yap
                price = random.choice([250, 300, 450, 500, 750, 1000, 1250])
                # Unsplash'ten rastgele çiçek resmi (cache'i kırmak için sig ekliyoruz)
                rand_id = random.randint(1, 1000)
                img_url = f"https://images.unsplash.com/photo-1507290439931-a861b5a38200?w=600&sig={rand_id}"
                
                payload = {
                    "name": prod_name,
                    "description": f"{seller['city']} {seller['district']} şubemizden özenle hazırlanan, {category} konseptli harika bir çiçek.",
                    "price": price,
                    "image_url": img_url,
                    "category": category, # Backend bu kategoriyi kaydedecek
                    "is_active": True
                }
                
                r = requests.post(f"{BASE_URL}/products/", json=payload, headers=headers)
                if r.status_code == 201:
                    total_added += 1
                    sys.stdout.write(".") # İlerleme çubuğu gibi nokta koy
                    sys.stdout.flush()
        
        print(" Tamamlandı.")

    print(f"\n\n🎉 MUAZZAM! Toplam {total_added} yeni çiçek veritabanına eklendi.")
    print("Artık Trabzon Of'tan Erzincan Merkez'e kadar her yer çiçek dolu!")

if __name__ == "__main__":
    try:
        generate_db()
    except Exception as e:
        print(f"Hata: {e}")