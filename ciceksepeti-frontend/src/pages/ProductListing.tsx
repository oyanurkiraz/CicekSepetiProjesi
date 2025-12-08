import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Loader2, SearchX } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
}

const ProductListing = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('search') || ""; // URL'deki ?search=gül kısmını alır
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndFilterProducts = async () => {
      setLoading(true);
      try {
        // 1. Tüm ürünleri Backend'den çek
        const response = await fetch("http://127.0.0.1:8000/products/");
        const allProducts: Product[] = await response.json();

        // 2. Arama kelimesine göre filtrele (Gül yazdıysa içinde 'gül' geçenleri bul)
        if (query) {
            const filtered = allProducts.filter(product => 
                product.name.toLowerCase().includes(query.toLowerCase()) || 
                product.description.toLowerCase().includes(query.toLowerCase())
            );
            setProducts(filtered);
        } else {
            setProducts(allProducts); // Arama yoksa hepsini göster
        }
        
      } catch (error) {
        console.error("Hata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndFilterProducts();
  }, [query]); // Query her değiştiğinde bu kod tekrar çalışır

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        "{query}" için sonuçlar
      </h2>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-rose-600" size={48} />
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-xl">
          <SearchX className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500 text-lg">Aradığınız kriterlere uygun çiçek bulunamadı.</p>
        </div>
      )}
    </div>
  );
};

export default ProductListing;