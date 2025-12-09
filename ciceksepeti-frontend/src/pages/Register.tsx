import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, MapPin, Building2, ArrowRight, AlertCircle } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'individual' | 'corporate'>('individual');
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "", // Bunu backend'e gönderirken parçalayacağız (first_name, last_name)
    phone: "",
    company_name: "",
    address: ""
  });
  
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- FORM KONTROLLERİ ---
  const validateForm = () => {
    // 1. Ad Soyad Kontrolü (En az iki kelime olmalı)
    if (!formData.full_name.trim().includes(" ")) {
        return "Lütfen hem Adınızı hem de Soyadınızı giriniz (Arada boşluk bırakın).";
    }

    // 2. Email Kontrolü
    const validDomains = ['@gmail.com', '@hotmail.com', '@outlook.com'];
    const email = formData.email.toLowerCase();
    const isValidDomain = validDomains.some(domain => email.endsWith(domain));
    
    if (!isValidDomain) {
      return "Lütfen geçerli bir Gmail veya Hotmail/Outlook adresi giriniz.";
    }

    // 3. Şifre Uzunluk
    if (formData.password.length <= 6) {
      return "Şifre 6 karakterden uzun olmalıdır.";
    }

    // 4. Şifre Rakam İçermeli
    if (!/\d/.test(formData.password)) {
      return "Şifre en az bir rakam içermelidir.";
    }

    // 5. Şifre Türkçe Karakter İçermemeli
    if (/[çğıöşüÇĞİÖŞÜ]/.test(formData.password)) {
      return "Şifre Türkçe karakter (ç,ğ,ı,ö,ş,ü) içermemelidir.";
    }

    // 6. Kurumsal Boş Alan Kontrolü
    if (userType === 'corporate') {
        if (!formData.company_name.trim() || !formData.address.trim()) {
            return "Kurum adı ve adres alanları boş bırakılamaz.";
        }
    }

    return null;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Frontend Validasyonu
    const validationError = validateForm();
    if (validationError) {
        setError(validationError);
        return;
    }

    const endpoint = userType === 'individual' 
      ? "http://127.0.0.1:8000/register/individual" 
      : "http://127.0.0.1:8000/register/corporate";

    // --- İSİM PARÇALAMA OPERASYONU 🔪 ---
    // "Ali Can Yılmaz" -> first_name: "Ali Can", last_name: "Yılmaz"
    const nameParts = formData.full_name.trim().split(" ");
    const lastName = nameParts.pop() || ""; // Son kelimeyi al (Soyad)
    const firstName = nameParts.join(" ");  // Geri kalanları birleştir (Ad)

    // --- PAYLOAD HAZIRLIĞI ---
    const payload = userType === 'individual' 
      ? { 
          email: formData.email, 
          password: formData.password, 
          first_name: firstName,     // Backend bunu istiyor
          last_name: lastName,       // Backend bunu istiyor
          phone: formData.phone,     // Backend 'phone' istiyor (phone_number değil)
          role: "individual"
        }
      : { 
          email: formData.email, 
          password: formData.password, 
          first_name: firstName,     // Backend bunu istiyor
          last_name: lastName,       // Backend bunu istiyor
          phone: formData.phone,     // Backend 'phone' istiyor
          company_name: formData.company_name,
          address: formData.address,
          role: "corporate"
        };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        let errorMessage = "Kayıt başarısız oldu.";
        if (errorData.detail) {
            if (Array.isArray(errorData.detail)) {
                // Hataları daha okunaklı yap
                errorMessage = errorData.detail.map((err: any) => {
                    const fieldName = err.loc[1] || err.loc[0];
                    return `${fieldName}: ${err.msg}`;
                }).join(" | ");
            } else {
                errorMessage = errorData.detail;
            }
        }
        
        throw new Error(errorMessage);
      }

      alert("Kayıt Başarılı! Giriş yapabilirsiniz.");
      navigate("/login");

    } catch (err: any) {
      console.error("Register Error:", err);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl shadow-xl">
        
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Aramıza Katılın</h2>
          <p className="mt-2 text-sm text-gray-600">
            {userType === 'individual' ? 'Bireysel üyeliğin avantajlarını keşfedin.' : 'Kurumsal hesabınızla satışa başlayın.'}
          </p>
        </div>

        {/* --- TAB (SEKME) GEÇİŞİ --- */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setUserType('individual')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              userType === 'individual' 
                ? 'bg-white text-rose-600 shadow-sm ring-1 ring-black/5' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Bireysel
          </button>
          <button
            type="button"
            onClick={() => setUserType('corporate')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              userType === 'corporate' 
                ? 'bg-white text-rose-600 shadow-sm ring-1 ring-black/5' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Kurumsal
          </button>
        </div>

        {/* HATA KUTUSU */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleRegister}>
          
          {/* Ad Soyad Girişi */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <User size={18} />
            </div>
            <input name="full_name" type="text" required placeholder="Ad Soyad"
              className="pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
              onChange={handleChange}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Mail size={18} />
            </div>
            <input name="email" type="email" required placeholder="E-posta (@gmail.com, @hotmail.com)"
              className="pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
              onChange={handleChange}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Lock size={18} />
            </div>
            <input name="password" type="password" required placeholder="Şifre (6+ hane, rakamlı)"
              className="pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
              onChange={handleChange}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Phone size={18} />
            </div>
            <input name="phone" type="text" placeholder="Telefon (5XX...)"
              className="pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
              onChange={handleChange}
            />
          </div>

          {userType === 'corporate' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Building2 size={18} />
                </div>
                <input name="company_name" type="text" placeholder="Kurum / Şirket Adı"
                  className="pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                  onChange={handleChange}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 top-3 pointer-events-none text-gray-400">
                  <MapPin size={18} />
                </div>
                <textarea name="address" rows={2} placeholder="Şirket Adresi"
                  className="pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 outline-none transition-all resize-none"
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          <button type="submit" 
            className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white shadow-lg transition-colors
            ${userType === 'individual' 
              ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200' 
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}
          >
            {userType === 'individual' ? 'Bireysel Üye Ol' : 'Kurumsal Üye Ol'} 
            <ArrowRight size={18} className="ml-2"/>
          </button>

          <div className="text-center mt-4">
            <button type="button" onClick={() => navigate('/login')} className="text-sm text-gray-600 hover:text-rose-600 font-medium">
              Zaten hesabınız var mı? Giriş Yapın
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Register;