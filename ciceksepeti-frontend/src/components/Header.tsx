import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Gift, Clock, LogOut } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Sayfa her yüklendiğinde "Cebimizde anahtar (token) var mı?" diye bak
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token); // Token varsa true, yoksa false olur
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Anahtarı çöpe at
    setIsLoggedIn(false);
    navigate("/login");
    window.location.reload(); // Sayfayı yenile ki her yer temizlensin
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">
        
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer flex-shrink-0"
          onClick={() => navigate('/')}
        >
          <div className="bg-rose-600 text-white p-2 rounded-full">
            <Gift size={24} />
          </div>
          <span className="text-2xl font-bold text-blue-900 tracking-tight">ÇiçekBahçesi</span>
        </div>

        {/* Arama */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:flex relative">
          <input 
            type="text" 
            placeholder="Çiçek, hediye veya kategori ara..." 
            className="w-full h-11 pl-5 pr-12 rounded-full border-2 border-gray-200 focus:border-rose-500 focus:outline-none transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="absolute right-1 top-1 bottom-1 bg-rose-600 text-white rounded-full w-10 flex items-center justify-center hover:bg-rose-700 transition-colors">
            <Search size={18} />
          </button>
        </form>

        {/* Sağ Menü */}
        <div className="flex items-center gap-2 lg:gap-6 flex-shrink-0">
          
          <button 
            onClick={() => navigate('/track')} 
            className="hidden lg:flex items-center gap-2 text-sm font-medium hover:text-rose-600 transition-colors"
          >
            <Clock size={20} />
            <span>Sipariş Takip</span>
          </button>

          {/* ÜYELİK MENÜSÜ (Burası değişti) */}
          <div className="relative group py-4">
            <button className="flex items-center gap-2 text-sm font-medium hover:text-rose-600 transition-colors">
              <User size={20} />
              {/* Giriş yaptıysa Hesabım, yapmadıysa Üyelik yazsın */}
              <span>{isLoggedIn ? "Hesabım" : "Üyelik"}</span>
            </button>
            
            <div className="absolute right-0 top-full w-48 bg-white shadow-xl rounded-lg border border-gray-100 hidden group-hover:block z-50">
               <div className="p-2 flex flex-col gap-1">
                 
                 {isLoggedIn ? (
                   // GİRİŞ YAPMIŞSA GÖRÜNECEKLER
                   <>
                     <button className="text-left px-4 py-2 hover:bg-rose-50 hover:text-rose-600 rounded-md text-sm font-medium">Siparişlerim</button>
                     <button className="text-left px-4 py-2 hover:bg-rose-50 hover:text-rose-600 rounded-md text-sm font-medium">Favorilerim</button>
                     <hr className="my-1 border-gray-100"/>
                     <button 
                        onClick={handleLogout}
                        className="text-left px-4 py-2 hover:bg-red-50 text-red-600 rounded-md text-sm font-medium flex items-center gap-2"
                     >
                       <LogOut size={16}/> Çıkış Yap
                     </button>
                   </>
                 ) : (
                   // GİRİŞ YAPMAMIŞSA GÖRÜNECEKLER
                   <>
                     <button 
                       onClick={() => navigate('/login')}
                       className="text-left px-4 py-2 hover:bg-rose-50 hover:text-rose-600 rounded-md text-sm font-medium"
                     >
                       Giriş Yap
                     </button>
                     <button 
                        onClick={() => navigate('/register')}
                        className="text-left px-4 py-2 hover:bg-rose-50 hover:text-rose-600 rounded-md text-sm font-medium"
                     >
                        Üye Ol
                     </button>
                     <hr className="my-1 border-gray-100"/>
                     <button className="text-left px-4 py-2 hover:bg-rose-50 hover:text-rose-600 rounded-md text-sm">Kurumsal Giriş</button>
                   </>
                 )}
               </div>
            </div>
          </div>

          <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition-colors shadow-lg shadow-green-200">
            <ShoppingCart size={20} />
            <span className="font-semibold">Sepetim</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;