import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, ArrowLeft } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // 1. Backend'e Giriş İsteği
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Giriş başarısız! E-posta veya şifre hatalı.");
      }

      const data = await response.json();
      const token = data.access_token;
      
      // Token'ı Kaydet
      localStorage.setItem("token", token);
      
      // 2. KULLANICININ ROLÜNÜ ÇEK
      const userRes = await fetch('http://127.0.0.1:8000/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
      });

      if (!userRes.ok) {
          throw new Error("Kullanıcı bilgileri alınamadı.");
      }

      const userData = await userRes.json();
      
      // 👇 KRİTİK: ROLÜ LOCAL STORAGE'A KAYDET
      localStorage.setItem("userRole", userData.role); 

      // 3. YÖNLENDİRMEYİ YAPMADAN ÖNCE HEADER'I MANUEL GÜNCELLEMEYE ZORLA
      window.dispatchEvent(new Event('storage')); 

      // 4. YÖNLENDİRME
      alert(`Giriş Başarılı! Hoş geldiniz ${userData.first_name || userData.email}`);
      
      if (userData.role === 'corporate') {
          navigate('/vendor'); 
      } else {
          navigate('/');
      }

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
            <Gift size={24} />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Tekrar Hoş Geldiniz
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Hesabınıza giriş yapın
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email-address" className="sr-only">E-posta Adresi</label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-rose-500 focus:border-rose-500 focus:z-10 sm:text-sm"
                placeholder="E-posta adresi"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Şifre</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-rose-500 focus:border-rose-500 focus:z-10 sm:text-sm"
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors shadow-lg shadow-rose-200"
            >
              Giriş Yap
            </button>
          </div>

          <div className="flex items-center justify-between mt-4">
              <button 
                type="button"
                onClick={() => navigate('/')}
                className="flex items-center text-sm text-gray-500 hover:text-gray-900"
              >
                <ArrowLeft size={16} className="mr-1"/> Anasayfaya Dön
              </button>
              <div className="text-sm">
                <a href="#" className="font-medium text-rose-600 hover:text-rose-500">
                  Şifremi unuttum?
                </a>
              </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;