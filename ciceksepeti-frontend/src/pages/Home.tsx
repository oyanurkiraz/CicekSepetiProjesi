import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import FlowerQuiz from '../components/FlowerQuiz'; // Test Bileşenimiz

const Home = () => {
  const navigate = useNavigate();
  const [showQuiz, setShowQuiz] = useState(false);

  // Kategoriye Gitme Yardımcısı
  const goToCategory = (cat: string) => {
    navigate(`/products?category=${cat}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      
      {/* GRID SİSTEMİ (2-3-2-1 Yapısı) 
         Mobilde tek sütun, orta ekranda grid yapısı
      */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">

        {/* --- 1. SATIR (2 Kutu) --- */}
        {/* Sol Büyük Kutu */}
        <div onClick={() => navigate('/products')} className="md:col-span-3 h-64 bg-rose-100 rounded-2xl relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all">
            <div className="absolute inset-0 flex flex-col justify-center p-8 z-10">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Günün Fırsatları</h2>
                <p className="text-gray-600 mb-4">En taze çiçeklerde indirimleri kaçırma.</p>
                <span className="flex items-center gap-2 font-bold text-rose-600 group-hover:underline">İncele <ArrowRight size={18}/></span>
            </div>
            <img src="https://images.unsplash.com/photo-1562690868-60bbe7624e6d?w=500" className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" alt="Fırsat"/>
        </div>

        {/* Sağ Büyük Kutu */}
        <div onClick={() => navigate('/products')} className="md:col-span-3 h-64 bg-blue-50 rounded-2xl relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all">
            <div className="absolute inset-0 flex flex-col justify-center p-8 z-10">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Aynı Gün Teslimat</h2>
                <p className="text-gray-600 mb-4">İstanbul içi 18:00'a kadar verilen siparişlerde.</p>
                <span className="flex items-center gap-2 font-bold text-blue-600 group-hover:underline">Sipariş Ver <ArrowRight size={18}/></span>
            </div>
            <img src="https://images.unsplash.com/photo-1591886960571-74d43a9d4166?w=500" className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" alt="Teslimat"/>
        </div>


        {/* --- 2. SATIR (3 Kutu - Kategoriler) --- */}
        <div onClick={() => goToCategory('Doğum Günü')} className="md:col-span-2 h-48 bg-white border-2 border-gray-100 rounded-2xl flex flex-col items-center justify-center p-4 cursor-pointer hover:border-rose-300 hover:shadow-lg transition-all group">
            <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">🎂</span>
            <h3 className="font-bold text-xl text-gray-800">Doğum Günü</h3>
        </div>

        <div onClick={() => goToCategory('Yılbaşı')} className="md:col-span-2 h-48 bg-white border-2 border-gray-100 rounded-2xl flex flex-col items-center justify-center p-4 cursor-pointer hover:border-red-300 hover:shadow-lg transition-all group">
            <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">🎄</span>
            <h3 className="font-bold text-xl text-gray-800">Yılbaşı</h3>
        </div>

        <div onClick={() => goToCategory('Aşk Tutku')} className="md:col-span-2 h-48 bg-white border-2 border-gray-100 rounded-2xl flex flex-col items-center justify-center p-4 cursor-pointer hover:border-rose-300 hover:shadow-lg transition-all group">
            <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">🌹</span>
            <h3 className="font-bold text-xl text-gray-800">Aşk & Tutku</h3>
        </div>


        {/* --- 3. SATIR (2 Kutu - Alt Kategoriler) --- */}
        <div onClick={() => goToCategory('Yeni İş')} className="md:col-span-3 h-40 bg-gray-50 rounded-2xl flex items-center justify-between px-8 cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200">
            <div>
                <h3 className="text-2xl font-bold text-gray-800">Yeni İş</h3>
                <p className="text-gray-500">Kariyer kutlamaları</p>
            </div>
            <img src="https://images.unsplash.com/photo-1497436072909-60f360e1d4b0?w=200" className="w-24 h-24 rounded-full object-cover shadow-md" alt="Yeni İş"/>
        </div>

        <div onClick={() => goToCategory('Özür Dilerim')} className="md:col-span-3 h-40 bg-gray-50 rounded-2xl flex items-center justify-between px-8 cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200">
            <div>
                <h3 className="text-2xl font-bold text-gray-800">Özür Dilerim</h3>
                <p className="text-gray-500">Kendini affettir</p>
            </div>
            <img src="https://images.unsplash.com/photo-1527061011665-3652c757a4d4?w=200" className="w-24 h-24 rounded-full object-cover shadow-md" alt="Özür"/>
        </div>


        {/* --- 4. SATIR (1 Kutu - Footer Üstü - AKLIMDAKİ ÇİÇEK) --- */}
        {/* 👇 İŞTE BU KUTU ARTIK TESTİ AÇIYOR 👇 */}
        <div 
            onClick={() => setShowQuiz(true)}
            className="md:col-span-6 bg-gradient-to-r from-purple-600 to-rose-600 rounded-3xl p-8 md:p-12 text-center text-white cursor-pointer hover:scale-[1.01] transition-transform shadow-xl relative overflow-hidden"
        >
            <div className="relative z-10">
                <Sparkles className="mx-auto mb-4 text-yellow-300 animate-pulse" size={48} />
                <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Kararsız mı Kaldınız?</h2>
                <p className="text-lg md:text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
                    Yapay zeka destekli asistanımız, aklınızdaki kişi için en mükemmel çiçeği bulsun.
                </p>
                <button className="bg-white text-rose-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg">
                    ✨ Aklımdaki Çiçeği Getir
                </button>
            </div>
            
            {/* Arkaplan Süslemeleri */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-300 opacity-10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>

      </div>

      {/* QUIZ MODALI (Gizli durur, açılınca gelir) */}
      <FlowerQuiz 
        isOpen={showQuiz} 
        onClose={() => setShowQuiz(false)} 
      />

    </div>
  );
};

export default Home;