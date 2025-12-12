import requests
import random
import sys

BASE_URL = "http://127.0.0.1:8000"

print("⏳ BÜYÜK ŞEHİRLER OPERASYONU BAŞLIYOR...")

# 1. BÜYÜK ŞEHİRLERİN TÜM İLÇELERİNE DÜKKAN AÇIYORUZ
major_sellers = [
    # İSTANBUL
    {"city": "İstanbul", "district": "Kadıköy", "name": "Kadıköy Merkez Çiçek"},
    {"city": "İstanbul", "district": "Beşiktaş", "name": "Beşiktaş Flora"},
    {"city": "İstanbul", "district": "Şişli", "name": "Şişli Garden"},
    {"city": "İstanbul", "district": "Üsküdar", "name": "Üsküdar Çiçek Evi"},
    {"city": "İstanbul", "district": "Maltepe", "name": "Maltepe Botanik"},
    {"city": "İstanbul", "district": "Bakırköy", "name": "Bakırköy Lalezar"},
    {"city": "İstanbul", "district": "Beyoğlu", "name": "Pera Çiçekçilik"},
    {"city": "İstanbul", "district": "Sarıyer", "name": "Boğaz Çiçekçisi"},

    # ANKARA
    {"city": "Ankara", "district": "Çankaya", "name": "Çankaya Köşk Çiçek"},
    {"city": "Ankara", "district": "Keçiören", "name": "Keçiören Sera"},
    {"city": "Ankara", "district": "Yenimahalle", "name": "Yeni Batı Çiçek"},
    {"city": "Ankara", "district": "Mamak", "name": "Mamak Garden"},
    {"city": "Ankara", "district": "Etimesgut", "name": "Etimesgut Flora"},
    {"city": "Ankara", "district": "Sincan", "name": "Sincan Çiçek Dünyası"},

    # İZMİR
    {"city": "İzmir", "district": "Konak", "name": "Kordon Çiçekçilik"},
    {"city": "İzmir", "district": "Karşıyaka", "name": "Karşıyaka Çarşı Çiçek"},
    {"city": "İzmir", "district": "Bornova", "name": "Bornova Kampüs Çiçek"},
    {"city": "İzmir", "district": "Buca", "name": "Buca Bahçe"},
    {"city": "İzmir", "district": "Alsancak", "name": "Alsancak Elite Çiçek"},
    {"city": "İzmir", "district": "Çeşme", "name": "Çeşme Yaz Çiçekleri"},

    # BURSA
    {"city": "Bursa", "district": "Nilüfer", "name": "Nilüfer Modern Çiçek"},
    {"city": "Bursa", "district": "Osmangazi", "name": "Ulu Çiçekçilik"},
    {"city": "Bursa", "district": "Yıldırım", "name": "Yeşil Bursa Çiçek"},
    {"city": "Bursa", "district": "Mudanya", "name": "Sahil Çiçek Evi"},

    # ANTALYA
    {"city": "Antalya", "district": "Muratpaşa", "name": "Antalya Merkez Flora"},
    {"city": "Antalya", "district": "Konyaaltı", "name": "Konyaaltı Sahil Çiçek"},
    {"city": "Antalya", "district": "Kepez", "name": "Kepez Sera Bahçe"},
    {"city": "Antalya", "district": "Alanya", "name": "Alanya Tropik Çiçek"},
]

# 2. ÜRÜN KATALOĞU (Tüm Kategoriler ve Tarzlar)
catalog = {
    "Yılbaşı": [
        "Kokina Şans Buketi", "Kırmızı Yılbaşı Rüyası", "Işıklı Masa Çamı", "Yılbaşı Kapı Süsü", 
        "Gold Işıltılı Aranjman", "Kozalaklı Kış Buketi", "Yeni Yıl Umut Çiçeği", "Kırmızı Atatürk Çiçeği",
        "Mutlu Yıllar Kutusu", "Kar Tanesi Beyaz Güller"
    ],
    "Doğum Günü": [
        "Gökkuşağı Papatyalar", "İyi ki Doğdun Gülleri", "Mutlu Yaşlar Orkidesi", "Renkli Lale Buketi",
        "Neşeli Gerbera Aranjmanı", "Doğum Günü Vazosu", "Prenses Pembe Güller", "Renkli Hüsnüyusuf",
        "Sürpriz Doğum Günü Kutusu", "Balonlu Çiçek Sepeti"
    ],
    "Aşk Tutku": [
        "101 Kırmızı Gül", "Sonsuz Aşk Kutusu", "Kalbim Seninle Aranjmanı", "Tutkulu Kırmızı Laleler",
        "Seni Seviyorum Buketi", "Aşkın Rengi Kırmızı", "Romantik Akşam Gülleri", "Kalp Vazoda Güller",
        "Tek Dal Özel Gül", "Büyülü Aşk Serisi"
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

def generate_major_db():
    total_added = 0
    
    for seller in major_sellers:
        print(f"\n📍 Büyük Şehir Dükkanı Açılıyor: {seller['name']} - {seller['district']}/{seller['city']}")
        
        # Türkçe karakter temizliği (email için)
        safe_name = seller['district'].lower().replace("ç","c").replace("ş","s").replace("ı","i").replace("ö","o").replace("ü","u").replace("ğ","g")
        email = f"{safe_name}_v2@cicek.com" # v2 ekledim çakışmasın diye
        password = "123"

        # KAYIT / GİRİŞ
        reg_payload = {
            "email": email, "password": password, "name": seller['name'],
            "role": "corporate", "city": seller['city'], "district": seller['district'],
            "company_name": seller['name'], "address": f"{seller['district']} Çarşı İçi No:5",
            "phone_number": "0212 555 55 55"
        }
        
        try:
            requests.post(f"{BASE_URL}/register/corporate", json=reg_payload)
        except: pass

        r_login = requests.post(f"{BASE_URL}/login", data={"username": email, "password": password})
        if r_login.status_code != 200:
            print("   ❌ Giriş yapılamadı, geçiliyor.")
            continue
            
        token = r_login.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # ÜRÜNLERİ YÜKLE
        for category, products in catalog.items():
            for prod_name in products:
                price = random.choice([350, 450, 550, 750, 950, 1500])
                rand_id = random.randint(1, 2000) # Farklı resimler için
                img_url = f"https://images.unsplash.com/photo-1507290439931-a861b5a38200?w=600&sig={rand_id}"
                
                payload = {
                    "name": prod_name,
                    "description": f"{seller['city']} - {seller['district']} şubemizden taptaze teslimat. {category} için mükemmel seçim.",
                    "price": price,
                    "image_url": img_url,
                    "category": category,
                    "is_active": True
                }
                
                r = requests.post(f"{BASE_URL}/products/", json=payload, headers=headers)
                if r.status_code == 201:
                    total_added += 1
                    sys.stdout.write(".")
                    sys.stdout.flush()
        
        print(" Tamamlandı.")

    print(f"\n\n🎉 OPERASYON BAŞARILI! Toplam {total_added} yeni çiçek büyük şehirlere eklendi.")

if __name__ == "__main__":
    try:
        generate_major_db()
    except Exception as e:
        print(f"Hata: {e}")