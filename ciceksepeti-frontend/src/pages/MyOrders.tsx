import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Truck, Calendar, ShoppingBag } from 'lucide-react';

interface Order {
  id: number;
  tracking_number: string;
  status: string;
  product: {
      name: string;
      image_url: string;
      price: number;
  };
  order_date: string; // ✅ BURASI order_date OLMALI
}

const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:8000/orders/", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            console.log("Gelen Veri:", data); // Konsoldan kontrol et
            setOrders(data);
        } catch (error) {
            console.error("Hata:", error);
        } finally {
            setLoading(false);
        }
    };
    fetchOrders();
  }, [navigate]);

  if (loading) return <div className="text-center py-20">Yükleniyor...</div>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
        <ShoppingBag className="text-rose-600"/> Siparişlerim
      </h1>

      <div className="space-y-6">
        {orders.length > 0 ? (
            orders.map((order) => (
                <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-center">
                    <img src={order.product?.image_url} alt="Ürün" className="w-24 h-24 object-cover rounded-lg bg-gray-100"/>
                    <div className="flex-1">
                        <h3 className="font-bold text-lg">{order.product?.name}</h3>
                        <p className="text-rose-600 font-bold">{order.product?.price} ₺</p>
                        <div className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                            <Calendar size={16}/> 
                            {/* Tarihi yazdırırken kontrol et */}
                            {order.order_date ? new Date(order.order_date).toLocaleDateString('tr-TR') : "Tarih Yok"}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-bold text-sm inline-flex items-center gap-2">
                            <Truck size={16}/> {order.status}
                        </div>
                        <div className="mt-2 text-sm text-gray-500 font-mono">
                            {order.tracking_number}
                        </div>
                    </div>
                </div>
            ))
        ) : (
            <div className="text-center py-12 text-gray-500">Henüz siparişiniz yok.</div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;