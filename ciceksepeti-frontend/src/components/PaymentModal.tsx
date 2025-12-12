import React, { useState } from 'react';
import { X, CreditCard, Calendar, Lock } from 'lucide-react';

interface PaymentModalProps {
  price: number;
  productName: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentDetails: any) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ price, productName, isOpen, onClose, onConfirm }) => {
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Burada basit bir validasyon yapabilirsin
    onConfirm({ cardName, cardNumber, expiry, cvv });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-xl font-bold text-gray-800">Güvenli Ödeme</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
        </div>

        <div className="bg-rose-50 p-4 rounded-xl mb-6 flex justify-between items-center">
            <span className="text-rose-800 font-medium truncate max-w-[200px]">{productName}</span>
            <span className="text-rose-600 font-bold text-lg">{price} ₺</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kart Üzerindeki İsim</label>
            <div className="relative">
                <input required type="text" placeholder="Ad Soyad" value={cardName} onChange={e => setCardName(e.target.value)}
                  className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 outline-none uppercase" />
                <UserIcon className="absolute left-3 top-3 text-gray-400" size={18}/>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kart Numarası</label>
            <div className="relative">
                <input required type="text" placeholder="0000 0000 0000 0000" maxLength={19} value={cardNumber} onChange={e => setCardNumber(e.target.value)}
                  className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 outline-none" />
                <CreditCard className="absolute left-3 top-3 text-gray-400" size={18}/>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">SKT (Ay/Yıl)</label>
                <div className="relative">
                    <input required type="text" placeholder="MM/YY" maxLength={5} value={expiry} onChange={e => setExpiry(e.target.value)}
                      className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 outline-none" />
                    <Calendar className="absolute left-3 top-3 text-gray-400" size={18}/>
                </div>
            </div>
            <div className="w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                <div className="relative">
                    <input required type="text" placeholder="123" maxLength={3} value={cvv} onChange={e => setCvv(e.target.value)}
                      className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 outline-none" />
                    <Lock className="absolute left-3 top-3 text-gray-400" size={18}/>
                </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-rose-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200 mt-4">
            {price} ₺ Öde ve Bitir
          </button>
        </form>
      </div>
    </div>
  );
};

// Basit ikon bileşeni (UserIcon'u yukarıda import etmedik, burada tanımlayalım)
const UserIcon = ({className, size}: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

export default PaymentModal;