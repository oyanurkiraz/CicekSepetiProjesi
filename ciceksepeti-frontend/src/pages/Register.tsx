import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, MapPin, Building2, ArrowRight, AlertCircle } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'individual' | 'corporate'>('individual');
  
  // Backend şemasına uygun state (full_name -> name)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "", // ARTIK NAME OLARAK TUTUYORUZ
    phone_number: "", // PHONE_NUMBER OLARAK TUTUYORUZ
    company_name: "",
    address: ""
  });
  
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const endpoint = userType === 'individual' 
      ? "http://127.0.0.1:8000/register/individual" 
      : "http://127.0.0.1:8000/register/corporate";

    // Veriyi direkt state'den alıp yolluyoruz, artık eşleştirmeye gerek yok
    const payload = userType === 'individual' 
      ? { 
          email: formData.email, 
          password: formData.password, 
          name: formData.name, 
          phone_number: formData.phone_number,
          role: "individual"
        }
      : { 
          email: formData.email, 
          password: formData.password, 
          name: formData.name,
          phone_number: formData.phone_number,
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
        throw new Error(errorData.detail || "Kayıt hatası");
      }

      alert("Kayıt Başarılı! Giriş yapabilirsiniz.");
      navigate("/login");

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Aramıza Katılın</h2>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button type="button" onClick={() => setUserType('individual')} className={`flex-1 py-2 text-sm font-medium rounded-md ${userType === 'individual' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500'}`}>Bireysel</button>
          <button type="button" onClick={() => setUserType('corporate')} className={`flex-1 py-2 text-sm font-medium rounded-md ${userType === 'corporate' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500'}`}>Kurumsal</button>
        </div>

        {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex gap-2"><AlertCircle size={18}/>{error}</div>}

        <form className="space-y-4" onSubmit={handleRegister}>
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400" size={18}/>
            <input name="name" type="text" required placeholder="Ad Soyad" className="pl-10 w-full p-3 border rounded-lg" onChange={handleChange}/>
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={18}/>
            <input name="email" type="email" required placeholder="E-posta" className="pl-10 w-full p-3 border rounded-lg" onChange={handleChange}/>
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={18}/>
            <input name="password" type="password" required placeholder="Şifre" className="pl-10 w-full p-3 border rounded-lg" onChange={handleChange}/>
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-3 text-gray-400" size={18}/>
            <input name="phone_number" type="text" placeholder="Telefon" className="pl-10 w-full p-3 border rounded-lg" onChange={handleChange}/>
          </div>

          {userType === 'corporate' && (
            <>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 text-gray-400" size={18}/>
                <input name="company_name" type="text" placeholder="Kurum Adı" className="pl-10 w-full p-3 border rounded-lg" onChange={handleChange}/>
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400" size={18}/>
                <textarea name="address" rows={2} placeholder="Adres" className="pl-10 w-full p-3 border rounded-lg" onChange={handleChange}/>
              </div>
            </>
          )}

          <button type="submit" className="w-full bg-rose-600 text-white py-3 rounded-lg font-bold hover:bg-rose-700">Üye Ol</button>
        </form>
      </div>
    </div>
  );
};

export default Register;