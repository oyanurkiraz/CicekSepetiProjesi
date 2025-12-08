import React from 'react';
import { Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="text-white font-bold text-lg mb-4">ÇiçekBahçesi</h4>
            <p className="text-sm">Sevdiklerinizi mutlu etmenin en doğal yolu. Türkiye'nin her yerine aynı gün teslimat.</p>
          </div>
          <div>
            <h4 className="text-white font-bold text-lg mb-4">Hızlı Erişim</h4>
            <ul className="space-y-2 text-sm">
              <li><button className="hover:text-white">Hakkımızda</button></li>
              <li><button className="hover:text-white">İletişim</button></li>
            </ul>
          </div>
          <div>
             <h4 className="text-white font-bold text-lg mb-4">Kategoriler</h4>
             <ul className="space-y-2 text-sm">
               <li><button className="hover:text-white">Güller</button></li>
               <li><button className="hover:text-white">Orkideler</button></li>
             </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-lg mb-4">Bize Ulaşın</h4>
            <div className="flex items-center gap-2 text-sm mb-2">
              <Phone size={16} />
              <span>0850 123 45 67</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin size={16} />
              <span>İstanbul, Türkiye</span>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-sm">
          &copy; 2025 ÇiçekBahçesi. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  );
};

export default Footer;