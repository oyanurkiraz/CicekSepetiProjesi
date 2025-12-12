import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import LocationModal from '../components/LocationModal';
import { MapPin, SlidersHorizontal } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  seller?: { city: string; district: string };
}

const ProductListing = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  
  const query = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";

  // Konum Filtreleri
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [showLocationModal, setShowLocationModal] = useState(false);

  // 1. SAYFA AÇILINCA KONTROL ET: KONUM YOKSA MODALI AÇ
  useEffect(() => {
    if (!city || !district) {
        setShowLocationModal(true);
    }
  }, []); // Sadece sayfa ilk yüklendiğinde çalışır

  // 2. ÜRÜNLERİ ÇEK
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = `http://127.0.0.1:8000/products/?`;
        
        if (query) url += `&search=${query}`;
        if (category) url += `&category=${category}`;
        
        // Eğer konum seçiliyse filtreye ekle
        if (city) url += `&city=${city}`;
        if (district) url += `&district=${district}`;

        const response = await fetch(url);
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Hata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [query, category, city, district]); // Konum değişince de tetiklenir

  return (
    <div className="container mx-auto px-4 py-8">
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
            <h2 className="text-3xl font-bold text-gray-800">
                {category ? `${category} Çiçekleri` : query ? `"${query}" Sonuçları` : "Tüm Çiçekler"}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
                {city ? `${city}, ${district} için sonuçlar` : "Konum seçilmedi"}
                {products.length > 0 && ` (${products.length} ürün)`}
            </p>
        </div>

        <div className="flex gap-3">
            <button 
                onClick={() => setShowLocationModal(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${city ? 'bg-rose-600 text-white' : 'bg-gray-900 text-white animate-bounce'}`}
            >
                <MapPin size={18}/>
                {city ? `${city}, ${district}` : "Konum Seçiniz"}
            </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">Yükleniyor...</div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard 
              key={product.id}
              id={product.id}
              name={product.name}
              description={product.description}
              price={product.price}
              image_url={product.image_url}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-2xl">
            <p className="text-gray-500 text-lg">Bu konumda veya kategoride çiçek bulunamadı.</p>
            {!city && <p className="text-sm text-rose-600 mt-2 font-bold cursor-pointer" onClick={() => setShowLocationModal(true)}>Lütfen önce konum seçiniz.</p>}
        </div>
      )}

      <LocationModal 
        isOpen={showLocationModal} 
        onClose={() => setShowLocationModal(false)} 
        onApply={(selectedCity, selectedDistrict) => {
            setCity(selectedCity);
            setDistrict(selectedDistrict);
        }}
      />
    </div>
  );
};

export default ProductListing;