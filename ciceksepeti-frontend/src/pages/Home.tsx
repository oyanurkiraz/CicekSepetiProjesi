import React from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryCard from '../components/CategoryCard';
import { Gift, Heart, Sun, CloudRain, Menu, ArrowRight } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  // Kategoriye tıklanınca Arama Sayfasına yönlendir
  const goToCategory = (categoryName: string) => {
    navigate(`/products?search=${categoryName}`);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* SATIR 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-64">
        <div onClick={() => goToCategory('Doğum Günü')} className="h-full">
          <CategoryCard 
            title="Doğum Günü Çiçekleri" 
            subtitle="Sevdiklerinize en özel sürpriz" 
            color="bg-pink-100" 
            textColor="text-pink-800"
            icon={<Gift size={48} className="text-pink-500 opacity-20 absolute right-4 bottom-4" />}
          />
        </div>
        <div onClick={() => goToCategory('Yılbaşı')} className="h-full">
          <CategoryCard 
            title="Yılbaşı Çiçekleri" 
            subtitle="Yeni yıla renkli bir başlangıç" 
            color="bg-red-100" 
            textColor="text-red-800"
            icon={<Heart size={48} className="text-red-500 opacity-20 absolute right-4 bottom-4" />}
          />
        </div>
      </div>

      {/* SATIR 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-56">
        <div onClick={() => goToCategory('Çok Satanlar')} className="h-full">
          <CategoryCard title="Çok Satanlar" subtitle="Herkesin favorisi" color="bg-amber-100" textColor="text-amber-800" icon={<Sun size={40} className="text-amber-500 opacity-20 absolute right-4 bottom-4" />} />
        </div>
        <div onClick={() => goToCategory('Geçmiş Olsun')} className="h-full">
           <CategoryCard title="Geçmiş Olsun" subtitle="Şifa dileyen notlarla" color="bg-blue-100" textColor="text-blue-800" icon={<CloudRain size={40} className="text-blue-500 opacity-20 absolute right-4 bottom-4" />} />
        </div>
        <div onClick={() => goToCategory('Saksı')} className="h-full">
           <CategoryCard title="Saksı Çiçekleri" subtitle="Evine doğallık kat" color="bg-green-100" textColor="text-green-800" icon={<Menu size={40} className="text-green-500 opacity-20 absolute right-4 bottom-4" />} />
        </div>
      </div>

       {/* SATIR 3 */}
       <div className="grid grid-cols-1 h-48">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between relative overflow-hidden shadow-2xl group cursor-pointer hover:shadow-indigo-300/50 transition-all">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="z-10 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2">Aklımdaki Çiçeği Getir!</h2>
            <p className="text-indigo-100 text-lg">Tarif et, hayalindeki aranjmanı senin için bulalım.</p>
          </div>
          <button className="z-10 mt-6 md:mt-0 bg-white text-indigo-600 px-8 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 group-hover:scale-105 transition-transform">
            Hemen Dene <ArrowRight size={20} />
          </button>
        </div>
      </div>

    </div>
  );
};

export default Home;