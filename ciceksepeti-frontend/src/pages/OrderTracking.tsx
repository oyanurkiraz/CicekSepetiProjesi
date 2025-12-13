import React, { useState } from 'react';
import { Search, Package, Truck, CheckCircle, Clock, AlertCircle, MapPin, NotebookPen } from 'lucide-react';

interface Product {
  name: string;
  image_url: string; 
}

interface OrderData {
  tracking_number: string;
  status: string;
  product: Product;
  receiver_name: string;
  receiver_phone: string;     // Yeni: Telefon
  receiver_address: string;   // Yeni: Tam Adres
  card_note: string;          // Yeni: Çiçek Notu
  delivery_date: string;
}

// Sipariş durumu için görsel eşleyici
const getStatusDisplay = (status: string) => {
    switch (status) {
        case "Sipariş Alındı":
            return { color: "bg-gray-200 text-gray-700", icon: <Package size={18} /> };
        case "Hazırlanıyor":
            return { color: "bg-orange-100 text-orange-700", icon: <Clock size={18} /> };
        case "Yola Çıktı":
            return { color: "bg-blue-100 text-blue-700", icon: <Truck size={18} /> };
        case "Teslim Edildi":
            return { color: "bg-green-100 text-green-700", icon: <CheckCircle size={18} /> };
        default:
            return { color: "bg-gray-100 text-gray-600", icon: <AlertCircle size={18} /> };
    }
};

const OrderTracking = () => {
  const [trackingCode, setTrackingCode] = useState("");
  const [order, setOrder] = useState<OrderData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOrder(null);
    
    const cleanCode = trackingCode.trim();

    if (!cleanCode) {
        setError("Lütfen bir takip kodu giriniz.");
        return;
    }

    setLoading(true);

    try {
      // Backend isteği (FastAPI /orders/track/{tracking_number} endpoint'ine gidiyor)
      const response = await fetch(`http://127.0.0.1:8000/orders/track/${cleanCode}`);
      
      if (!response.ok) {
        throw new Error("Sipariş bulunamadı. Kodu kontrol edip tekrar deneyin.");
      }

      const data: OrderData = await response.json();
      setOrder(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const statusDisplay = order ? getStatusDisplay(order.status) : getStatusDisplay("");

  return (
    <div className="min-h-[60vh] flex flex-col items-center py-12 px-4">
      <div className="text-center mb-10 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Sipariş Takibi</h1>
        <p className="text-gray-500 mb-8">Sipariş kodunuzu girerek kargonuzun durumunu anlık sorgulayın.</p>
        
        <form onSubmit={handleTrack} className="flex relative shadow-lg rounded-full">
          <input 
            type="text" 
            placeholder="Takip Kodu (Örn: ORD-XXXXXX)" 
            className="w-full h-14 pl-6 pr-16 rounded-full border-2 border-gray-200 focus:border-rose-500 focus:outline-none text-lg transition-colors"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={loading}
            className="absolute right-2 top-2 bottom-2 bg-rose-600 text-white rounded-full w-12 h-10 flex items-center justify-center hover:bg-rose-700 transition-colors disabled:bg-gray-400"
          >
            {loading ? <Clock className="animate-spin" /> : <Search />}
          </button>
        </form>

        {error && (
          <div className="mt-4 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200 flex items-center justify-center gap-2">
            <AlertCircle size={18} /> {error}
          </div>
        )}
      </div>

      {order && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-3xl w-full animate-in fade-in slide-in-from-bottom-4">
          
          <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-6">
            <div>
              <p className="text-sm text-gray-500">Takip Numarası</p>
              <h3 className="text-xl font-bold text-gray-800 tracking-wider font-mono">{order.tracking_number}</h3>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${statusDisplay.color}`}>
              {statusDisplay.icon}
              {order.status}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Ürün Bilgisi */}
            <div className="flex flex-col gap-1">
              <span className="text-gray-500 text-sm flex items-center gap-2 mb-1"><Package size={16}/> Ürün</span>
              <img src={order.product?.image_url} alt={order.product?.name} className="w-20 h-20 object-cover rounded-md mb-2"/>
              <span className="font-semibold text-gray-800">{order.product?.name}</span>
            </div>
            
            {/* Alıcı ve Teslimat Tarihi */}
            <div className="flex flex-col gap-1">
              <span className="text-gray-500 text-sm flex items-center gap-2 mb-1"><CheckCircle size={16}/> Alıcı Bilgisi</span>
              <span className="font-semibold text-gray-800">{order.receiver_name}</span>
              <span className="text-sm text-gray-600">Tel: {order.receiver_phone}</span>
            </div>
            
            {/* Adres Detayı */}
            <div className="flex flex-col gap-1 md:col-span-1">
                <span className="text-gray-500 text-sm flex items-center gap-2 mb-1"><MapPin size={16}/> Adres</span>
                <span className="font-semibold text-gray-800 text-sm">{order.receiver_address}</span>
            </div>

            {/* Çiçek Notu ve Teslimat Tarihi */}
            <div className="flex flex-col gap-1">
              <span className="text-gray-500 text-sm flex items-center gap-2 mb-1"><Clock size={16}/> Tahmini Teslimat</span>
              <span className="font-semibold text-gray-800 mb-2">{order.delivery_date}</span>
              
              <span className="text-gray-500 text-sm flex items-center gap-2 mt-2"><NotebookPen size={16}/> Çiçek Notu</span>
              <p className="italic text-gray-800 text-sm bg-yellow-50 p-2 rounded">
                  "{order.card_note || 'Yok'}"
              </p>
            </div>

          </div>
          
        </div>
      )}
    </div>
  );
};

export default OrderTracking;