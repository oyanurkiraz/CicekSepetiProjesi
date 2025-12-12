import React, { useState } from 'react';
import { X, CreditCard, User, MapPin, Phone, FileText, ArrowRight, Check, Calendar, Lock, Clock } from 'lucide-react';

interface OrderWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  productPrice: number;
  productName: string;
  onConfirmOrder: (details: any) => void;
}

const OrderWizardModal: React.FC<OrderWizardModalProps> = ({ isOpen, onClose, productPrice, productName, onConfirmOrder }) => {
  const [step, setStep] = useState(1);

  // Form Verileri
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [cardNote, setCardNote] = useState("");
  
  // YENİ EKLENENLER 👇
  const [deliveryDate, setDeliveryDate] = useState(""); 
  const [deliveryTime, setDeliveryTime] = useState("09:00 - 12:00");

  // Kart Verileri
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  if (!isOpen) return null;

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmOrder({
      receiver_name: receiverName,
      receiver_phone: receiverPhone,
      receiver_address: receiverAddress,
      card_note: cardNote,
      delivery_date: `${deliveryDate} (${deliveryTime})` // Tarih ve Saati birleştirip yolluyoruz
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        
        <div className="bg-rose-50 p-4 border-b border-rose-100 flex justify-between items-center">
          <div>
             <h3 className="text-lg font-bold text-gray-800">Sipariş Oluştur</h3>
             <p className="text-sm text-rose-600 font-medium">{productName} - {productPrice} ₺</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
        </div>

        <div className="flex border-b bg-gray-50">
            <div className={`flex-1 p-3 text-center text-sm font-bold border-b-2 transition-colors ${step === 1 ? 'border-rose-600 text-rose-600 bg-white' : 'border-transparent text-gray-400'}`}>1. Teslimat Bilgileri</div>
            <div className={`flex-1 p-3 text-center text-sm font-bold border-b-2 transition-colors ${step === 2 ? 'border-rose-600 text-rose-600 bg-white' : 'border-transparent text-gray-400'}`}>2. Ödeme</div>
        </div>

        <div className="p-6 overflow-y-auto">
            {step === 1 && (
                <form onSubmit={handleNextStep} className="space-y-4">
                    {/* Alıcı Adı */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Alıcı Adı Soyadı</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-gray-400" size={18}/>
                            <input required type="text" value={receiverName} onChange={e => setReceiverName(e.target.value)} className="w-full pl-10 p-3 border rounded-lg focus:ring-rose-500 focus:border-rose-500 outline-none"/>
                        </div>
                    </div>

                    {/* Telefon */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Alıcı Telefon</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 text-gray-400" size={18}/>
                            <input required type="text" value={receiverPhone} onChange={e => setReceiverPhone(e.target.value)} className="w-full pl-10 p-3 border rounded-lg focus:ring-rose-500 focus:border-rose-500 outline-none"/>
                        </div>
                    </div>

                    {/* YENİ: Tarih ve Saat Seçimi */}
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Teslimat Tarihi</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 text-gray-400" size={18}/>
                                <input required type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} className="w-full pl-10 p-3 border rounded-lg focus:ring-rose-500 focus:border-rose-500 outline-none"/>
                            </div>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Saat Aralığı</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-3 text-gray-400" size={18}/>
                                <select value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)} className="w-full pl-10 p-3 border rounded-lg focus:ring-rose-500 focus:border-rose-500 outline-none bg-white">
                                    <option>09:00 - 12:00</option>
                                    <option>12:00 - 15:00</option>
                                    <option>15:00 - 18:00</option>
                                    <option>18:00 - 22:00</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Adres */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teslimat Adresi</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 text-gray-400" size={18}/>
                            <textarea required rows={2} value={receiverAddress} onChange={e => setReceiverAddress(e.target.value)} className="w-full pl-10 p-3 border rounded-lg focus:ring-rose-500 focus:border-rose-500 outline-none resize-none"/>
                        </div>
                    </div>

                    {/* Not */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kart Notu (İsteğe Bağlı)</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 text-gray-400" size={18}/>
                            <input type="text" value={cardNote} onChange={e => setCardNote(e.target.value)} className="w-full pl-10 p-3 border rounded-lg focus:ring-rose-500 focus:border-rose-500 outline-none"/>
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-rose-600 text-white py-3 rounded-xl font-bold hover:bg-rose-700 transition-colors flex items-center justify-center gap-2 mt-4">
                        Ödemeye Geç <ArrowRight size={18}/>
                    </button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleFinalSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4">
                    {/* ÖDEME FORMU (Aynı Kalabilir) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kart Üzerindeki İsim</label>
                        <div className="relative">
                            <input required type="text" value={cardHolder} onChange={e => setCardHolder(e.target.value)} className="w-full pl-10 p-3 border rounded-lg outline-none uppercase"/>
                            <User className="absolute left-3 top-3 text-gray-400" size={18}/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kart Numarası</label>
                        <div className="relative">
                            <input required type="text" maxLength={19} value={cardNumber} onChange={e => setCardNumber(e.target.value)} className="w-full pl-10 p-3 border rounded-lg outline-none"/>
                            <CreditCard className="absolute left-3 top-3 text-gray-400" size={18}/>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">SKT</label>
                            <input required type="text" maxLength={5} value={expiry} onChange={e => setExpiry(e.target.value)} placeholder="AA/YY" className="w-full p-3 border rounded-lg outline-none"/>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                            <input required type="text" maxLength={3} value={cvv} onChange={e => setCvv(e.target.value)} placeholder="123" className="w-full p-3 border rounded-lg outline-none"/>
                        </div>
                    </div>
                    
                    <div className="flex gap-3 mt-6">
                        <button type="button" onClick={() => setStep(1)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200">Geri Dön</button>
                        <button type="submit" className="flex-[2] bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200 flex items-center justify-center gap-2">
                           <Check size={18}/> Siparişi Tamamla ({productPrice} ₺)
                        </button>
                    </div>
                </form>
            )}
        </div>
      </div>
    </div>
  );
};

export default OrderWizardModal;