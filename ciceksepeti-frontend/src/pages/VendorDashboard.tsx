import React, { useState, useEffect, useCallback } from "react";
// Sadece kullanılan Lucide ikonlarını tuttuk
import { Store, Package, Truck, CheckCircle, Clock } from 'lucide-react';

// --- Veri Tipleri ---
interface Product {
  id: number;
  name: string;
  image_url: string;
  price: number;
  description: string;
  category: string;
}

interface Order {
  id: number;
  tracking_number: string;
  receiver_name: string;
  receiver_phone: string;
  receiver_address: string;
  card_note: string;
  status: string;
  product: Product | null;
}

type InputChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;


const VendorDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newProduct, setNewProduct] = useState({ name: "", description: "", price: 0, image_url: "", category: "" });

  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");
  const BASE_URL = "http://127.0.0.1:8000";
  const isCorporate = userRole === 'corporate';


  // --- API İŞLEMLERİ ---

  const fetchData = useCallback(async () => {
    if (!token || !isCorporate) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };

      const [ordersRes, productsRes] = await Promise.all([
        fetch(`${BASE_URL}/vendor/orders`, { headers }),
        fetch(`${BASE_URL}/vendor/products`, { headers }),
      ]);

      if (!ordersRes.ok || !productsRes.ok) {
        throw new Error("Veri yüklenirken sunucu hatası oluştu.");
      }

      const ordersData = await ordersRes.json();
      const productsData = await productsRes.json();

      if (Array.isArray(ordersData)) {
        setOrders(ordersData);
      } else {
        setOrders([]);
      }

      if (Array.isArray(productsData)) {
        setProducts(productsData);
      } else {
        setProducts([]);
      }

      setLoading(false);

    } catch (error: any) {
      console.error("Veri Çekme Hatası:", error);
      setLoading(false);
    }
  }, [token, isCorporate, BASE_URL]);


  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Debug kodu (Senin kontrolün)
  useEffect(() => {
    if (orders.length > 0) {
      console.log("DEBUG KESİN KONTROL: Orders state'i başarıyla doldu. Uzunluk:", orders.length);
    }
  }, [orders]);

  // --- Fonksiyonlar ---

  const updateStatus = async (id: number, newStatus: string) => {
    if (!id || !newStatus) {
      console.error("Status güncelleme için ID veya Yeni Status eksik.");
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/vendor/orders/${id}/status?status_text=${newStatus}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (res.ok) {
        fetchData();
      } else {
        alert("Durum güncellenemedi.");
      }
    } catch (error) { }
  };

  const deleteProduct = async (id: number) => {
    if (window.confirm("Bu ürünü silmek istediğine emin misin?")) {
      try {
        const res = await fetch(`${BASE_URL}/vendor/products/${id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (res.status === 204) {
          setProducts(products.filter((p) => p.id !== id));
        } else {
          alert("Silme başarısız.");
        }
      } catch (error) { }
    }
  };

  const updatePrice = async (id: number, newPrice: number) => {
    if (isNaN(newPrice) || newPrice <= 0) {
      alert("Geçerli bir fiyat giriniz.");
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/vendor/products/${id}/price?price=${newPrice}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (res.ok) {
        alert("Fiyat güncellendi!");
        fetchData();
      } else {
        alert("Fiyat güncelleme başarısız.");
      }
    } catch (error) { }
  };

  const handleProductChange = (e: InputChangeEvent) => {
    const { name, value } = e.target;
    setNewProduct({
      ...newProduct,
      [name]: name === "price" ? parseFloat(value) : value,
    });
  };

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/products/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ ...newProduct, price: newProduct.price || 0, is_active: true }),
      });

      if (res.ok) {
        alert("Ürün başarıyla eklendi!");
        setIsAdding(false);
        setNewProduct({ name: "", description: "", price: 0, image_url: "", category: "" });
        fetchData();
      } else {
        const errorData = await res.json();
        alert(`Ürün ekleme başarısız: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      alert("Ürün ekleme sırasında bir hata oluştu.");
    }
  };

  // ----------------------------------------------------

  // Rol kontrolü ve ilk yükleme ekranları
  if (!token) {
    return <div className="p-10 text-center text-red-600 font-bold">Bu sayfaya erişmek için giriş yapmalısınız.</div>;
  }

  if (!isCorporate) {
    return <div className="p-10 text-center text-red-600 font-bold">Bu sayfaya sadece Kurumsal (Mağaza) hesaplar erişebilir.</div>;
  }

  if (loading) return <div className="p-10 text-center font-bold">Veriler Yükleniyor...</div>;


  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-extrabold mb-8 text-green-700 border-b pb-3">
        🏪 Mağaza Yönetim Paneli
      </h1>

      {/* --- BÖLÜM 1: ÜRÜN EKLEME FORMU --- */}
      <div className="mb-10 p-6 border rounded-lg shadow-xl bg-gray-50">
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition duration-200"
        >
          {isAdding ? "Ürün Ekleme Formunu Gizle" : "+ Yeni Çiçek Ekle"}
        </button>

        {isAdding && (
          <form onSubmit={addProduct} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Form Alanları */}
            <input name="name" onChange={handleProductChange} value={newProduct.name} placeholder="Çiçek Adı" required className="p-3 border rounded" />
            <input name="price" type="number" step="0.01" onChange={handleProductChange} value={newProduct.price || ''} placeholder="Fiyat (TL)" required className="p-3 border rounded" />
            <input name="image_url" onChange={handleProductChange} value={newProduct.image_url} placeholder="Resim URL'si" required className="p-3 border rounded" />
            <input name="category" onChange={handleProductChange} value={newProduct.category} placeholder="Kategori (Örn: Aşk, Doğum Günü)" className="p-3 border rounded" />
            <textarea name="description" onChange={handleProductChange} value={newProduct.description} placeholder="Açıklama" required className="p-3 border rounded col-span-full"></textarea>

            <button type="submit" className="col-span-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700">
              Ürünü Kaydet
            </button>
          </form>
        )}
      </div>

      {/* --- BÖLÜM 2: GELEN SİPARİŞLER TABLOSU --- */}
      <div className="mb-10 p-6 border rounded-lg shadow-xl bg-white">
        <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-red-600">📦 Gelen Siparişler</h2>

        {orders.length === 0 ? (
          <p className="text-gray-500">Henüz bekleyen siparişiniz yok.</p>
        ) : (
          /* CSS ZORLAMASI */
          <div className="overflow-x-auto" style={{ minHeight: '150px' }}>
            <table className="min-w-full bg-white border border-collapse">
              <thead>
                <tr className="bg-red-50 text-left text-sm text-gray-700">
                  <th className="p-3 border">Takip No</th>
                  <th className="p-3 border">Alıcı Bilgisi</th>
                  <th className="p-3 border">Çiçek Notu</th>
                  <th className="p-3 border">Ürün</th>
                  <th className="p-3 border">Durum</th>
                  <th className="p-3 border">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => {
                  // Debug: Her siparişi kontrol et
                  console.log("Siparis render ediliyor:", order);

                  // Agresif kontrol - sadece order yoksa atla
                  if (!order) {
                    console.log("Order null, atlaniyor");
                    return null;
                  }

                  const product = order.product;
                  const productName = product?.name || 'Ürün Bilgisi Yok';
                  const productImageUrl = product?.image_url || 'https://via.placeholder.com/40';

                  return (
                    <tr key={order.id || index} className="hover:bg-gray-50 border-b">
                      <td className="p-3 border font-mono text-xs font-bold text-blue-600">
                        {order.tracking_number || 'YOK'}
                      </td>
                      <td className="p-3 border text-sm">
                        <div className="font-semibold">{order.receiver_name || 'Bilinmiyor'}</div>
                        <div className="text-gray-600">📍 {order.receiver_address || 'Adres Yok'}</div>
                        <div className="text-gray-500 text-xs">📞 {order.receiver_phone || 'Tel Yok'}</div>
                      </td>
                      <td className="p-3 border italic text-red-700 text-sm font-medium">
                        "{order.card_note || 'Yok'}"
                      </td>
                      <td className="p-3 border">
                        <div className="flex items-center gap-2">
                          <img
                            src={productImageUrl}
                            alt={productName}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <span className="text-sm font-semibold">{productName}</span>
                        </div>
                      </td>
                      <td className="p-3 border">
                        <span className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${order.status === "Teslim Edildi" ? "bg-green-500" :
                            order.status === "Yola Çıktı" ? "bg-blue-500" : "bg-orange-500"
                          }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-3 border">
                        <select
                          className="border p-2 rounded text-sm bg-white cursor-pointer w-full"
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          defaultValue={order.status}
                        >
                          <option value="Sipariş Alındı">Sipariş Alındı</option>
                          <option value="Hazırlanıyor">Hazırlanıyor</option>
                          <option value="Yola Çıktı">Yola Çıktı</option>
                          <option value="Teslim Edildi">Teslim Edildi</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- BÖLÜM 3: SATIŞTAKİ ÜRÜNLER ve DÜZENLEME --- */}
      <div className="p-6 border rounded-lg shadow-xl bg-white">
        <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-green-600">🌸 Satıştaki Ürünlerim</h2>
        {products.length === 0 ? (
          <p className="text-gray-500">Hiç ürün eklememişsiniz.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {products.map(product => (
              <div key={product.id} className="border p-4 rounded-lg hover:shadow-2xl transition-shadow bg-gray-50 flex flex-col justify-between">
                <div>
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-40 object-cover mb-3 rounded-md"
                  />
                  <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                </div>

                <div className="mt-3">
                  {/* FİYAT GÜNCELLEME */}
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="number"
                      step="0.01"
                      defaultValue={product.price}
                      id={`price-${product.id}`}
                      className="border p-2 rounded w-2/3 text-xl font-bold text-green-600"
                    />
                    <button
                      onClick={() => {
                        const newPrice = parseFloat((document.getElementById(`price-${product.id}`) as HTMLInputElement).value);
                        updatePrice(product.id, newPrice);
                      }}
                      className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition w-1/3 text-sm"
                    >
                      Fiyatı Güncelle
                    </button>
                  </div>

                  {/* ÜRÜN SİLME */}
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition-colors font-semibold"
                  >
                    Ürünü Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;