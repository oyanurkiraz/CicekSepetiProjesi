import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowRight, ShoppingBag, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CartOrderModal from '../components/CartOrderModal';

const Cart = () => {
    const navigate = useNavigate();
    const { cart, removeFromCart, clearCart, getTotalPrice } = useCart();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const token = localStorage.getItem("token");

    const handleCheckout = () => {
        if (!token) {
            alert("Sipariş vermek için lütfen giriş yapın.");
            navigate("/login");
            return;
        }
        setIsModalOpen(true);
    };

    const handleOrderComplete = () => {
        clearCart();
        setIsModalOpen(false);
    };

    if (cart.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-lg mx-auto text-center">
                    <div className="bg-gray-100 p-8 rounded-full w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                        <ShoppingCart size={48} className="text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Sepetiniz Boş</h2>
                    <p className="text-gray-500 mb-8">Henüz sepetinize ürün eklemediniz. Hemen alışverişe başlayın!</p>
                    <button
                        onClick={() => navigate('/products')}
                        className="bg-rose-600 text-white px-8 py-4 rounded-full font-bold hover:bg-rose-700 transition-colors inline-flex items-center gap-2 shadow-lg"
                    >
                        <ShoppingBag size={20} /> Alışverişe Başla
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <ShoppingCart className="text-rose-600" /> Sepetim
                </h1>
                <span className="text-gray-500">{cart.length} ürün</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sol: Ürün Listesi */}
                <div className="lg:col-span-2 space-y-4">
                    {cart.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-4 hover:shadow-md transition-shadow"
                        >
                            {/* Ürün Resmi */}
                            <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                                <img
                                    src={item.image_url}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/200?text=Resim+Yok" }}
                                />
                            </div>

                            {/* Ürün Bilgileri */}
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <h3
                                        className="font-bold text-gray-800 hover:text-rose-600 cursor-pointer transition-colors"
                                        onClick={() => navigate(`/product/${item.id}`)}
                                    >
                                        {item.name}
                                    </h3>
                                    <p className="text-sm text-gray-500">Adet: {item.quantity}</p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xl font-bold text-rose-600">{item.price * item.quantity} ₺</span>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors"
                                        title="Sepetten Çıkar"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sağ: Sipariş Özeti */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Package size={20} /> Sipariş Özeti
                        </h3>

                        <div className="space-y-3 mb-6">
                            {cart.map((item) => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span className="text-gray-600 truncate max-w-[60%]">{item.name} x{item.quantity}</span>
                                    <span className="font-medium">{item.price * item.quantity} ₺</span>
                                </div>
                            ))}
                            <hr className="my-4" />
                            <div className="flex justify-between text-lg font-bold">
                                <span>Toplam</span>
                                <span className="text-rose-600">{getTotalPrice()} ₺</span>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout}
                            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-200"
                        >
                            Siparişi Tamamla <ArrowRight size={18} />
                        </button>

                        <button
                            onClick={() => navigate('/products')}
                            className="w-full mt-3 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                        >
                            Alışverişe Devam Et
                        </button>
                    </div>
                </div>
            </div>

            {/* Sipariş Modalı */}
            <CartOrderModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                cartItems={cart}
                totalPrice={getTotalPrice()}
                onOrderComplete={handleOrderComplete}
            />
        </div>
    );
};

export default Cart;
