import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Heart, ArrowLeft } from 'lucide-react';

const Favorites = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavs = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }
        try {
            // Backend'den favorileri çek
            const response = await fetch("http://127.0.0.1:8000/favorites/", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            setFavorites(data);
        } catch (error) {
            console.error("Favoriler yüklenirken hata:", error);
        } finally {
            setLoading(false);
        }
    };
    fetchFavs();
  }, [navigate]);

  if (loading) return <div className="text-center py-20 text-rose-600 font-medium">Favoriler Yükleniyor...</div>;

  return (
    <div className="container mx-auto px-4 py-8 min-h-[60vh]">
      
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-gray-600"/>
        </button>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="fill-rose-600 text-rose-600"/> Favorilerim
        </h1>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {favorites.map((fav) => (
            // Backend bize { id: 1, product: {...} } dönüyor.
            // ProductCard'a direkt product objesini yayıyoruz.
            <ProductCard 
              key={fav.product.id}
              {...fav.product} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <Heart className="mx-auto text-gray-300 mb-4" size={48}/>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Listeniz Boş</h3>
            <p className="text-gray-500 mb-6">Henüz beğendiğiniz bir ürün eklemediniz.</p>
            <button 
                onClick={() => navigate('/products')} 
                className="bg-rose-600 text-white px-8 py-3 rounded-full font-bold hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200"
            >
                Ürünleri Keşfet
            </button>
        </div>
      )}
    </div>
  );
};

export default Favorites;