import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Gift, Clock, LogOut, Heart, Package, Store } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'individual' | 'corporate' | null>(null);

  // Rol bilgisini API'den çeker ve localStorage'a kaydeder (Bu kod Login.tsx tarafından da çağrılıyor)
  const fetchUserInfo = useCallback(async (token: string) => {
      try {
          const response = await fetch('http://127.0.0.1:8000/auth/me', {
              headers: { Authorization: `Bearer ${token}` }
          });
          if (response.ok) {
              const userData = await response.json();
              localStorage.setItem("userRole", userData.role);
              setUserRole(userData.role); 
              return userData.role;
          } else {
              handleLogout(); 
              return null;
          }
      } catch (error) {
          console.error("Kullanıcı bilgisi çekilemedi", error);
          return null;
      }
  }, []);

  // Giriş durumunu ve rolü kontrol etme fonksiyonu
  const checkAuthStatus = useCallback(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole") as 'individual' | 'corporate' | null;
    
    setIsLoggedIn(!!token);
    setUserRole(role);
    
    // Token var ama rol bilgisi kayıpsa HIZLICA çek. (Login sonrası ilk yükleme senaryosu)
    if (token && !role) {
        fetchUserInfo(token);
    }
  }, [fetchUserInfo]);

  useEffect(() => {
    // Sayfa yüklendiğinde durumu kontrol et
    checkAuthStatus();
    
    // localStorage'daki değişiklikleri dinle (Login.tsx'ten gelen event burada tetiklenir)
    window.addEventListener('storage', checkAuthStatus); 

    return () => {
        window.removeEventListener('storage', checkAuthStatus);
    }
  }, [checkAuthStatus]); 

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole"); 
    setIsLoggedIn(false);
    setUserRole(null);
    navigate("/login");
  };

  // Hesap/Mağaza linkinin yolunu ve etiketini belirle
  const isCorporate = userRole === 'corporate';
  const profilePath = isCorporate ? '/vendor' : '/my-account';
  const profileLabel = isCorporate ? '🏪 Mağazam' : '👤 Hesabım';

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">
        
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer flex-shrink-0"
          onClick={() => navigate('/')}
        >
          <div className="bg-rose-600 text-white p-2 rounded-full shadow-md">
            <Gift size={24} />
          </div>
          <span className="text-2xl font-bold text-gray-800 tracking-tight">Çiçek<span className="text-rose-600">Sepeti</span></span>
        </div>

        {/* Arama Çubuğu */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:flex relative group">
          <input 
            type="text" 
            placeholder="Çiçek, hediye veya kategori ara..." 
            className="w-full h-12 pl-5 pr-14 rounded-full border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-rose-500 focus:outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="absolute right-2 top-2 bottom-2 bg-rose-600 text-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-rose-700 transition-colors shadow-sm">
            <Search size={18} />
          </button>
        </form>

        {/* Sağ Menü */}
        <div className="flex items-center gap-3 lg:gap-6 flex-shrink-0">
          
          <button 
            onClick={() => navigate('/track')} 
            className="hidden lg:flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-rose-600 transition-colors"
          >
            <Clock size={20} />
            <span>Sipariş Takip</span>
          </button>

          {/* ÜYELİK MENÜSÜ */}
          <div className="relative group py-4">
            <button className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-rose-600 transition-colors">
              <div className={`p-2 rounded-full transition-colors ${isCorporate ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                {isCorporate ? <Store size={20} /> : <User size={20} />}
              </div>
              <span className="hidden sm:inline">{isLoggedIn ? profileLabel : "Giriş Yap"}</span>
            </button>
            
            {/* Dropdown Menü */}
            <div className="absolute right-0 top-[90%] w-56 bg-white shadow-xl rounded-2xl border border-gray-100 hidden group-hover:block z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
               <div className="p-2 flex flex-col gap-1">
                 
                 {isLoggedIn ? (
                    <>
                       {/* MAĞAZAM / HESABIM BUTONU */}
                       <button 
                          onClick={() => navigate(profilePath)}
                          className="text-left px-4 py-3 hover:bg-rose-50 hover:text-rose-600 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors"
                       >
                          {isCorporate ? <Store size={18}/> : <User size={18}/>} {profileLabel}
                       </button>

                       {/* SİPARİŞLERİM BUTONU - Sadece Bireysel Görür */}
                       {!isCorporate && (
                            <button 
                                onClick={() => navigate('/my-orders')}
                                className="text-left px-4 py-3 hover:bg-rose-50 hover:text-rose-600 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors"
                            >
                                <Package size={18}/> Siparişlerim
                            </button>
                        )}
                        
                       {/* FAVORİLERİM BUTONU - Sadece Bireysel Görür */}
                       {!isCorporate && (
                            <button 
                                onClick={() => navigate('/favorites')}
                                className="text-left px-4 py-3 hover:bg-rose-50 hover:text-rose-600 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors"
                            >
                                <Heart size={18}/> Favorilerim
                            </button>
                        )}
                        
                       <hr className="my-1 border-gray-100"/>
                       
                       <button 
                          onClick={handleLogout}
                          className="text-left px-4 py-3 hover:bg-red-50 text-red-600 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors"
                       >
                         <LogOut size={18}/> Çıkış Yap
                       </button>
                    </>
                 ) : (
                    <>
                       <button onClick={() => navigate('/login')} className="text-left px-4 py-3 hover:bg-rose-50 hover:text-rose-600 rounded-xl text-sm font-medium">Giriş Yap</button>
                       <button onClick={() => navigate('/register')} className="text-left px-4 py-3 hover:bg-rose-50 hover:text-rose-600 rounded-xl text-sm font-medium">Üye Ol</button>
                    </>
                 )}
               </div>
            </div>
          </div>

          {/* Sepet Butonu - Sadece Bireysel Görür */}
          {!isCorporate && (
              <button 
                onClick={() => navigate('/cart')} 
                className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-full hover:bg-green-700 transition-all shadow-lg shadow-green-200 hover:-translate-y-0.5"
              >
                <ShoppingCart size={20} />
                <span className="font-bold hidden sm:inline">Sepetim</span>
              </button>
          )}
          
        </div>
      </div>
    </header>
  );
};

export default Header;