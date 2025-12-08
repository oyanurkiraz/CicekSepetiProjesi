import React from 'react';
import { ShoppingCart } from 'lucide-react';

// Gelen verinin tipini tanımlıyoruz
interface ProductCardProps {
  name: string;
  description: string;
  price: number;
  image_url: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ name, description, price, image_url }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col h-full">
      
      {/* Ürün Resmi */}
      <div className="h-48 w-full relative">
        <img 
          src={image_url} 
          alt={name} 
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
          // Eğer resim yüklenemezse (kırık linkse) varsayılan bir çiçek resmi gösterelim
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1561181286-d3fee7d55364?q=80&w=1000&auto=format&fit=crop"; 
          }}
        />
      </div>

      {/* İçerik */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-800 mb-1">{name}</h3>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{description}</p>
        
        {/* Fiyat ve Buton */}
        <div className="mt-auto flex items-center justify-between">
          <span className="text-xl font-bold text-rose-600">
            {price} ₺
          </span>
          
          <button className="bg-green-100 text-green-700 p-2 rounded-full hover:bg-green-600 hover:text-white transition-colors">
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;