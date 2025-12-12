import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react'; // Heart ikonu eklendi
import OrderWizardModal from './OrderWizardModal';

interface ProductCardProps {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ id, name, description, price, image_url }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFav, setIsFav] = useState(false); // Favori durumu

  // --- 1. FAVORİ EKLEME/ÇIKARMA ---
  const handleToggleFav = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Karta tıklayınca detay sayfasına gitmesini engelle
    
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Favorilere eklemek için lütfen giriş yapın.");
        navigate("/login");
        return;
    }

    try {
        const response = await fetch(`http://127.0.0.1:8000/favorites/${id}`, {
            method: "POST",
            headers: { 
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            // Backend "removed" veya "added" döner, ona göre state güncelle
            // Ama biz şimdilik basitçe tersine çevirelim:
            setIsFav(!isFav);
            // İstersen kullanıcıya bildirim ver: alert(data.message);
        } else {
            console.error("Favori işlemi başarısız");
        }
    } catch (error) {
        console.error("Favori hatası", error);
    }
  };

  // --- 2. HIZLI SATIN AL BUTONU (MODAL AÇAR) ---
  const handleQuickBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Sipariş vermek için lütfen önce giriş yapın.");
        navigate("/login");
        return;
    }
    setIsModalOpen(true);
  };

  // --- 3. SİPARİŞİ TAMAMLAMA (BACKEND İSTEĞİ) ---
  const handleConfirmOrder = async (orderDetails: any) => {
    try {
        const token = localStorage.getItem("token");
        const orderPayload = {
            product_id: id,
            ...orderDetails, // receiver_name, address, date vb.
        };

        const response = await fetch("http://127.0.0.1:8000/orders/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(orderPayload)
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Sipariş oluşturulamadı.");
        }

        const data = await response.json();
        alert(`🎉 Siparişiniz Alındı!\n\nTakip Kodunuz: ${data.tracking_number}\n\nSiparişlerim sayfasından kontrol edebilirsiniz.`);
        setIsModalOpen(false);

    } catch (error: any) {
        alert("Hata: " + error.message);
    }
  };

  return (
    <>
      <div 
        onClick={() => navigate(`/product/${id}`)} 
        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col h-full cursor-pointer group relative"
      >
        {/* Resim Alanı */}
        <div className="h-48 w-full relative">
          <img 
            src={image_url} 
            alt={name} 
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
            onError={(e) => {(e.target as HTMLImageElement).src = "https://via.placeholder.com/500?text=Resim+Yok"}}
          />
          
          {/* ❤️ KALP BUTONU (SAĞ ÜST KÖŞE) */}
          <button 
            onClick={handleToggleFav}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white hover:scale-110 transition-all z-20 group/heart"
            title="Favorilere Ekle"
          >
            <Heart 
                size={20} 
                className={`transition-colors ${isFav ? "fill-rose-600 text-rose-600" : "text-gray-400 group-hover/heart:text-rose-500"}`}
            />
          </button>
        </div>

        {/* İçerik */}
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-rose-600 transition-colors">{name}</h3>
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">{description}</p>
          
          <div className="mt-auto flex items-center justify-between">
            <span className="text-xl font-bold text-rose-600">{price} ₺</span>
            
            {/* 🛒 YEŞİL SEPET BUTONU */}
            <button 
              onClick={handleQuickBuy}
              className="bg-green-100 text-green-700 p-2 rounded-full hover:bg-green-600 hover:text-white transition-colors z-10 relative shadow-sm"
              title="Hızlı Satın Al"
            >
              <ShoppingCart size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* SİHİRBAZ MODAL (GİZLİ, TETİKLENİNCE AÇILIR) */}
      <OrderWizardModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        productPrice={price}
        productName={name}
        onConfirmOrder={handleConfirmOrder}
      />
    </>
  );
};

export default ProductCard;