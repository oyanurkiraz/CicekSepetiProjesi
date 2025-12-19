import React, { useState } from 'react';
import { X, CreditCard, User, MapPin, Phone, FileText, ArrowRight, Check, Calendar, Clock, ShoppingBag, AlertCircle, CheckCircle } from 'lucide-react';
import { CartItem } from '../context/CartContext';

interface CartOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    cartItems: CartItem[];
    totalPrice: number;
    onOrderComplete: () => void;
}

const CartOrderModal: React.FC<CartOrderModalProps> = ({ isOpen, onClose, cartItems, totalPrice, onOrderComplete }) => {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentResult, setPaymentResult] = useState<{ status: string; message: string } | null>(null);

    // Alıcı Form Verileri
    const [receiverName, setReceiverName] = useState("");
    const [receiverPhone, setReceiverPhone] = useState("");
    const [receiverAddress, setReceiverAddress] = useState("");
    const [receiverEmail, setReceiverEmail] = useState("");
    const [cardNote, setCardNote] = useState("");
    const [deliveryDate, setDeliveryDate] = useState("");
    const [deliveryTime, setDeliveryTime] = useState("09:00 - 12:00");

    // Kart Verileri
    const [cardNumber, setCardNumber] = useState("");
    const [cardHolder, setCardHolder] = useState("");
    const [expireMonth, setExpireMonth] = useState("");
    const [expireYear, setExpireYear] = useState("");
    const [cvv, setCvv] = useState("");

    if (!isOpen) return null;

    const handleNextStep = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(2);
    };

    const handleFinalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setPaymentResult(null);

        const token = localStorage.getItem("token");

        // 1. İlk önce iyzico ödeme işlemi
        const paymentPayload = {
            paymentCard: {
                cardHolderName: cardHolder,
                cardNumber: cardNumber.replace(/\s/g, ''),
                expireMonth: expireMonth,
                expireYear: expireYear,
                cvc: cvv
            },
            buyer: {
                name: receiverName.split(' ')[0] || receiverName,
                surname: receiverName.split(' ').slice(1).join(' ') || 'Müşteri',
                phone: receiverPhone,
                email: receiverEmail || 'musteri@ciceksepeti.com',
                address: receiverAddress,
                city: 'Istanbul'
            },
            basketItems: cartItems.map(item => ({
                id: `BI${item.id}`,
                name: item.name,
                price: (item.price * item.quantity).toFixed(2),
                category: 'Çiçek'
            })),
            totalPrice: totalPrice.toFixed(2)
        };

        try {
            // iyzico ödeme isteği
            const paymentResponse = await fetch("http://127.0.0.1:8000/payment/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(paymentPayload)
            });

            const paymentData = await paymentResponse.json();

            if (paymentData.status === 'success') {
                // 2. Ödeme başarılıysa siparişleri oluştur
                const orderDetails = {
                    receiver_name: receiverName,
                    receiver_phone: receiverPhone,
                    receiver_address: receiverAddress,
                    card_note: cardNote,
                    delivery_date: `${deliveryDate} (${deliveryTime})`
                };

                const trackingNumbers: string[] = [];

                for (const item of cartItems) {
                    for (let i = 0; i < item.quantity; i++) {
                        const orderResponse = await fetch("http://127.0.0.1:8000/orders/", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                product_id: item.id,
                                ...orderDetails
                            })
                        });

                        if (orderResponse.ok) {
                            const orderData = await orderResponse.json();
                            trackingNumbers.push(orderData.tracking_number);
                        }
                    }
                }

                setPaymentResult({
                    status: 'success',
                    message: `Ödeme başarılı! ${trackingNumbers.length} sipariş oluşturuldu.\n\nTakip Kodları:\n${trackingNumbers.join('\n')}`
                });

                // 3 saniye sonra modal kapansın
                setTimeout(() => {
                    onOrderComplete();
                }, 3000);

            } else {
                setPaymentResult({
                    status: 'failure',
                    message: paymentData.message || 'Ödeme işlemi başarısız oldu.'
                });
            }

        } catch (error: any) {
            setPaymentResult({
                status: 'failure',
                message: error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Ödeme sonucu gösterimi
    if (paymentResult) {
        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-in fade-in zoom-in-95">
                    {paymentResult.status === 'success' ? (
                        <>
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle size={48} className="text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">Ödeme Başarılı! 🎉</h3>
                            <p className="text-gray-600 whitespace-pre-line mb-6">{paymentResult.message}</p>
                            <p className="text-sm text-gray-400">Otomatik olarak yönlendiriliyorsunuz...</p>
                        </>
                    ) : (
                        <>
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertCircle size={48} className="text-red-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">Ödeme Başarısız</h3>
                            <p className="text-gray-600 mb-6">{paymentResult.message}</p>
                            <button
                                onClick={() => setPaymentResult(null)}
                                className="bg-rose-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-rose-700"
                            >
                                Tekrar Dene
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">

                <div className="bg-green-50 p-4 border-b border-green-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <ShoppingBag size={20} className="text-green-600" /> Sepet Siparişi
                        </h3>
                        <p className="text-sm text-green-600 font-medium">{cartItems.length} ürün - {totalPrice} ₺</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>

                <div className="flex border-b bg-gray-50">
                    <div className={`flex-1 p-3 text-center text-sm font-bold border-b-2 transition-colors ${step === 1 ? 'border-green-600 text-green-600 bg-white' : 'border-transparent text-gray-400'}`}>1. Teslimat Bilgileri</div>
                    <div className={`flex-1 p-3 text-center text-sm font-bold border-b-2 transition-colors ${step === 2 ? 'border-green-600 text-green-600 bg-white' : 'border-transparent text-gray-400'}`}>2. iyzico ile Öde</div>
                </div>

                <div className="p-6 overflow-y-auto">
                    {step === 1 && (
                        <form onSubmit={handleNextStep} className="space-y-4">
                            {/* Ürün Özeti */}
                            <div className="bg-gray-50 p-4 rounded-xl mb-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">Sepetinizdeki Ürünler:</p>
                                <div className="space-y-1">
                                    {cartItems.map(item => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <span className="text-gray-600">{item.name} x{item.quantity}</span>
                                            <span className="font-medium">{item.price * item.quantity} ₺</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Alıcı Adı */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Alıcı Adı Soyadı</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input required type="text" value={receiverName} onChange={e => setReceiverName(e.target.value)} className="w-full pl-10 p-3 border rounded-lg focus:ring-green-500 focus:border-green-500 outline-none" />
                                </div>
                            </div>

                            {/* Telefon */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Alıcı Telefon</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input required type="text" value={receiverPhone} onChange={e => setReceiverPhone(e.target.value)} placeholder="+905xxxxxxxxx" className="w-full pl-10 p-3 border rounded-lg focus:ring-green-500 focus:border-green-500 outline-none" />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">E-posta (Ödeme için gerekli)</label>
                                <div className="relative">
                                    <input required type="email" value={receiverEmail} onChange={e => setReceiverEmail(e.target.value)} placeholder="ornek@email.com" className="w-full p-3 border rounded-lg focus:ring-green-500 focus:border-green-500 outline-none" />
                                </div>
                            </div>

                            {/* Tarih ve Saat Seçimi */}
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Teslimat Tarihi</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <input required type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} className="w-full pl-10 p-3 border rounded-lg focus:ring-green-500 focus:border-green-500 outline-none" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Saat Aralığı</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <select value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)} className="w-full pl-10 p-3 border rounded-lg focus:ring-green-500 focus:border-green-500 outline-none bg-white">
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
                                    <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <textarea required rows={2} value={receiverAddress} onChange={e => setReceiverAddress(e.target.value)} className="w-full pl-10 p-3 border rounded-lg focus:ring-green-500 focus:border-green-500 outline-none resize-none" />
                                </div>
                            </div>

                            {/* Not */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kart Notu (İsteğe Bağlı)</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input type="text" value={cardNote} onChange={e => setCardNote(e.target.value)} className="w-full pl-10 p-3 border rounded-lg focus:ring-green-500 focus:border-green-500 outline-none" />
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 mt-4">
                                Ödemeye Geç <ArrowRight size={18} />
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleFinalSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            {/* iyzico Bilgi */}
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-4">
                                <p className="text-sm text-blue-700 font-medium">🔒 Güvenli ödeme iyzico altyapısı ile sağlanmaktadır.</p>
                                <p className="text-xs text-blue-600 mt-1">Test Kartı: 5528790000000008</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kart Üzerindeki İsim</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input required type="text" value={cardHolder} onChange={e => setCardHolder(e.target.value.toUpperCase())} className="w-full pl-10 p-3 border rounded-lg outline-none uppercase" placeholder="JOHN DOE" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kart Numarası</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input required type="text" maxLength={19} value={cardNumber} onChange={e => setCardNumber(e.target.value)} className="w-full pl-10 p-3 border rounded-lg outline-none" placeholder="5528 7900 0000 0008" />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ay</label>
                                    <input required type="text" maxLength={2} value={expireMonth} onChange={e => setExpireMonth(e.target.value)} placeholder="12" className="w-full p-3 border rounded-lg outline-none" />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Yıl</label>
                                    <input required type="text" maxLength={4} value={expireYear} onChange={e => setExpireYear(e.target.value)} placeholder="2030" className="w-full p-3 border rounded-lg outline-none" />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                                    <input required type="text" maxLength={3} value={cvv} onChange={e => setCvv(e.target.value)} placeholder="123" className="w-full p-3 border rounded-lg outline-none" />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setStep(1)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200">Geri Dön</button>
                                <button type="submit" disabled={isSubmitting} className="flex-[2] bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200 flex items-center justify-center gap-2 disabled:bg-gray-400">
                                    {isSubmitting ? 'Ödeme İşleniyor...' : <><Check size={18} /> {totalPrice} ₺ Öde</>}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CartOrderModal;
