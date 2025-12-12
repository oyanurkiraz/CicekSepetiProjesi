import React, { useState, useEffect } from 'react';
import { MapPin, X, Check } from 'lucide-react';
import { citiesData } from '../data/cities';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (city: string, district: string) => void;
}

const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose, onApply }) => {
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [districts, setDistricts] = useState<string[]>([]);

  // Şehir değişince ilçeleri güncelle
  useEffect(() => {
    if (selectedCity) {
      setDistricts(citiesData[selectedCity] || []);
      setSelectedDistrict(""); // İlçe seçimini sıfırla
    }
  }, [selectedCity]);

  if (!isOpen) return null;

  const handleApply = () => {
    if (selectedCity && selectedDistrict) {
      onApply(selectedCity, selectedDistrict);
      onClose();
    } else {
        alert("Lütfen hem İl hem de İlçe seçiniz.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <MapPin className="text-rose-600"/> Konum Seçimi
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X/></button>
        </div>
        
        <p className="text-gray-500 text-sm mb-6">
            Size en yakın çiçekçileri göstermek için lütfen gönderim yapılacak adresi seçin.
        </p>

        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">İl</label>
                <select 
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-rose-500 focus:border-rose-500 outline-none"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                >
                    <option value="">Seçiniz</option>
                    {Object.keys(citiesData).map(city => (
                        <option key={city} value={city}>{city}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">İlçe</label>
                <select 
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-rose-500 focus:border-rose-500 outline-none disabled:bg-gray-100"
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    disabled={!selectedCity}
                >
                    <option value="">{selectedCity ? "İlçe Seçiniz" : "Önce İl Seçiniz"}</option>
                    {districts.map(dist => (
                        <option key={dist} value={dist}>{dist}</option>
                    ))}
                </select>
            </div>

            <button 
                onClick={handleApply}
                className="w-full bg-rose-600 text-white py-3 rounded-xl font-bold hover:bg-rose-700 transition-colors flex items-center justify-center gap-2 mt-4"
            >
                <Check size={18}/> Uygula ve Devam Et
            </button>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;